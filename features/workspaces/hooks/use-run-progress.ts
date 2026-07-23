"use client";

import { useEffect, useReducer, useRef } from "react";
import { openRunStream } from "@/lib/sse";
import { workspaceApi } from "../workspace.api";
import { isRunTerminal, type RunState, type RunStatus, type RunStep } from "../workspace.types";

// ── The reducer: the SINGLE source of truth for run state. ──
// Both the SSE stream AND the polling fallback dispatch into this, so the two paths can never
// diverge — whichever is feeding it, the UI reads one consistent state.
type SnapshotPayload = Partial<RunState> & { status: RunStatus; progress: number; steps: RunStep[] };

type Action =
  | { kind: "snapshot"; snapshot: SnapshotPayload } // full (poll) OR partial (SSE) — see mergeSnapshot
  | { kind: "step"; name: string; status: RunStep["status"]; label?: string }
  | { kind: "progress"; progress: number }
  | { kind: "terminal"; status: RunStatus; creditsRefunded?: number };

// SSE's `snapshot` event is confirmed live to be a SUBSET of the full RunState — it has no
// workspaceId/currentStep/creditsCharged/creditsRefunded/error, and its steps have no `error`.
// A GET /runs/:id poll returns the FULL shape. Merging field-by-field (rather than replacing
// wholesale) means an SSE-sourced snapshot can never wipe out richer data the priming poll fetch
// already established. Steps are unioned by name, never dropped, so a later SSE snapshot with
// fewer entries than we already know about can't roll the timeline backward either.
function mergeSnapshot(state: RunState | null, incoming: SnapshotPayload): RunState {
  if (!state) return incoming as RunState; // first snapshot ever — always the full priming poll fetch

  const steps = [...state.steps];
  for (const incomingStep of incoming.steps) {
    const idx = steps.findIndex((s) => s.name === incomingStep.name);
    if (idx === -1) {
      steps.push(incomingStep);
    } else {
      steps[idx] = {
        ...incomingStep,
        error: incomingStep.error ?? steps[idx].error ?? null,
        label: steps[idx].label ?? incomingStep.label,
      };
    }
  }

  return {
    id: incoming.id ?? state.id,
    workspaceId: incoming.workspaceId ?? state.workspaceId,
    status: incoming.status,
    progress: incoming.progress,
    currentStep: "currentStep" in incoming ? (incoming.currentStep as string | null) : state.currentStep,
    creditsCharged: incoming.creditsCharged ?? state.creditsCharged,
    creditsRefunded: incoming.creditsRefunded ?? state.creditsRefunded,
    error: "error" in incoming ? (incoming.error as string | null) : state.error,
    steps,
  };
}

function reducer(state: RunState | null, action: Action): RunState | null {
  switch (action.kind) {
    case "snapshot":
      return mergeSnapshot(state, action.snapshot);
    case "step": {
      if (!state) return state;
      const idx = state.steps.findIndex((s) => s.name === action.name);
      const nextStep: RunStep =
        idx === -1
          ? { name: action.name, status: action.status, error: null, label: action.label }
          : { ...state.steps[idx], status: action.status, label: action.label ?? state.steps[idx].label };
      const steps = idx === -1 ? [...state.steps, nextStep] : state.steps.map((s, i) => (i === idx ? nextStep : s));
      return { ...state, steps };
    }
    case "progress":
      return state ? { ...state, progress: action.progress } : state;
    case "terminal":
      return state ? { ...state, status: action.status, creditsRefunded: action.creditsRefunded ?? state.creditsRefunded } : state;
    default:
      return state;
  }
}

interface StepEventData {
  step: string;
  progress?: number;
  label?: string;
  willRetry?: boolean;
}
interface RunTerminalEventData {
  status?: RunStatus;
  refundedCredits?: number;
}

export function useRunProgress(runId: string | null) {
  const [state, dispatch] = useReducer(reducer, null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnects = useRef(0);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;

    // ── polling fallback: same reducer, so state stays identical to the stream path ──
    const startPolling = () => {
      if (pollRef.current) return;
      const tick = async () => {
        try {
          const run = await workspaceApi.getRun(runId);
          if (cancelled) return;
          dispatch({ kind: "snapshot", snapshot: run }); // full shape — same reducer path as SSE
          if (isRunTerminal(run.status)) stopPolling();
        } catch {
          // keep trying
        }
      };
      tick(); // immediate first poll
      pollRef.current = setInterval(tick, 3000);
    };
    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    // ── the SSE path ──
    const connect = async () => {
      try {
        const unsubscribe = await openRunStream(
          runId,
          (evt) => {
            reconnects.current = 0; // any event = a healthy connection
            switch (evt.type) {
              case "snapshot":
                dispatch({ kind: "snapshot", snapshot: evt.data as SnapshotPayload });
                break;
              case "step.started": {
                const d = evt.data as StepEventData;
                dispatch({ kind: "step", name: d.step, status: "running", label: d.label });
                if (typeof d.progress === "number") dispatch({ kind: "progress", progress: d.progress });
                break;
              }
              case "step.completed": {
                const d = evt.data as StepEventData;
                dispatch({ kind: "step", name: d.step, status: "completed" });
                if (typeof d.progress === "number") dispatch({ kind: "progress", progress: d.progress });
                break;
              }
              case "step.skipped": {
                const d = evt.data as StepEventData;
                dispatch({ kind: "step", name: d.step, status: "skipped" });
                break;
              }
              case "step.failed": {
                // The backend retries a step internally up to 3x before giving up. Showing
                // "failed" on the first internal attempt would flicker red then recover — only
                // mark failed once willRetry is false. Confirmed live: this event carries no
                // error message (that only comes from the poll/GET endpoint).
                const d = evt.data as StepEventData;
                if (!d.willRetry) dispatch({ kind: "step", name: d.step, status: "failed" });
                break;
              }
              case "run.completed": {
                const d = evt.data as RunTerminalEventData;
                dispatch({ kind: "terminal", status: d.status ?? "completed" });
                unsubscribeRef.current?.();
                break;
              }
              case "run.failed": {
                // Confirmed live shape: { status, refundedCredits, failedSteps }.
                const d = evt.data as RunTerminalEventData;
                dispatch({ kind: "terminal", status: d.status ?? "failed", creditsRefunded: d.refundedCredits });
                unsubscribeRef.current?.();
                break;
              }
              case "ping":
              case "error":
                // ping: heartbeat, ignore. error: see the note in lib/sse.ts — this shares the
                // same onerror-driven reconnect/poll path below, which handles it fine.
                break;
            }
          },
          () => {
            // onerror: transient blip → retry the stream a couple times. Persistent → poll.
            if (cancelled) return;
            reconnects.current += 1;
            if (reconnects.current <= 2) setTimeout(connect, 1000 * reconnects.current);
            else startPolling();
          },
        );
        if (cancelled) {
          unsubscribe();
          return;
        }
        unsubscribeRef.current = unsubscribe;
      } catch {
        // Couldn't even mint a ticket → skip straight to polling.
        if (!cancelled) startPolling();
      }
    };

    // Prime with one immediate fetch so the screen isn't blank while the stream connects, AND so
    // a run that already finished (reconnect/late open) shows its final state at once.
    workspaceApi
      .getRun(runId)
      .then((run) => {
        if (cancelled) return;
        dispatch({ kind: "snapshot", snapshot: run });
        if (isRunTerminal(run.status)) return; // already done — no stream needed
        connect();
      })
      .catch(() => connect());

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      stopPolling();
    };
  }, [runId]);

  return state;
}
