"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { H2, H3, Caption } from "@/components/ui/typography";
import { useAdminRun } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { AdminRunDetail, AdminStep } from "../admin.types";

// NOT the shared StatusBadge (components/ui/status-badge.tsx) — its map only covers
// WorkspaceStatus (created/queued/processing/completed/partial/failed) and is missing
// "running"/"pending"/"skipped", which this data's real RunStatus/StepStatus vocabulary
// (features/workspaces/workspace.types.ts) does include — confirmed live, a real run had
// `skipped` steps (parse_resume/parse_jd, attempt 0, on a re-analyze where nothing changed).
// Same reasoning CLAUDE.md already documents for why JobStatusBadge/ResumeStatusBadge are
// separate from it.
function RunStatusPill({ status }: { status: string }) {
  const tone = status === "completed" ? "success" : status === "failed" ? "danger" : status === "partial" ? "warning" : status === "running" || status === "processing" ? "primary" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

function durationSec(startedAt: string | null, finishedAt: string | null): number | null {
  if (!startedAt || !finishedAt) return null;
  return Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000);
}

export function RunInspector({ runId }: { runId: string }) {
  const { data, isLoading, error } = useAdminRun(runId);

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <AdminQueryBoundary error={error}>
      {data && (
        <div className="space-y-6">
          <RunSummary run={data.run} />
          <StepTimeline steps={data.steps} />
        </div>
      )}
    </AdminQueryBoundary>
  );
}

function RunSummary({ run }: { run: AdminRunDetail["run"] }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <H2>Run {run.id.slice(0, 8)}</H2>
            <RunStatusPill status={run.status} />
          </div>
          <Caption className="mt-1 block font-mono">
            user {run.userId.slice(0, 8)} · workspace {run.workspaceId.slice(0, 8)}
          </Caption>
        </div>
        <div className="text-right">
          <Caption>Real AI cost</Caption>
          <p className="font-mono text-xl font-bold text-ink">${Number(run.totalCostUsd).toFixed(4)}</p>
        </div>
      </div>

      {/* Credits: charged vs refunded — the first thing to check on a billing complaint. */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
        <Stat label="Charged" value={run.creditsCharged} />
        <Stat label="Refunded" value={run.creditsRefunded} tone={run.creditsRefunded > 0 ? "warning" : undefined} />
        <Stat label="Progress" value={`${run.progress}%`} />
        <Stat label="Duration" value={(() => { const s = durationSec(run.startedAt, run.finishedAt); return s != null ? `${s}s` : "—"; })()} />
      </div>

      {run.error && (
        <div className="mt-4 rounded-lg bg-danger/10 p-3">
          <Caption className="text-danger">Run error</Caption>
          <p className="mt-1 font-mono text-xs text-danger">{run.error}</p>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "warning" }) {
  return (
    <div>
      <p className={tone === "warning" ? "font-mono text-lg font-semibold text-warning" : "font-mono text-lg font-semibold text-ink"}>{value}</p>
      <Caption>{label}</Caption>
    </div>
  );
}

function StepTimeline({ steps }: { steps: AdminStep[] }) {
  return (
    <Card>
      <H3 className="mb-4">Step timeline</H3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-ink-secondary">
              <th className="pb-2 font-medium">Step</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Attempt</th>
              <th className="pb-2 font-medium text-right">Duration</th>
              <th className="pb-2 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {steps.map((s) => (
              <StepRow key={s.id} step={s} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function StepRow({ step }: { step: AdminStep }) {
  const seconds = durationSec(step.startedAt, step.finishedAt);
  return (
    <>
      <tr>
        <td className="py-2.5">
          <p className="font-mono text-xs text-ink">{step.name}</p>
          {/* Added Sprint 7 specifically so an inspector can jump from a step to what it
              produced — e.g. "cover_letters:7a5aadfd-…" or "ats_reports:1ce29e8e-…". */}
          {step.outputRef && <Caption className="font-mono">→ {step.outputRef}</Caption>}
        </td>
        <td className="py-2.5">
          <RunStatusPill status={step.status} />
        </td>
        <td className="py-2.5 text-ink-secondary">{step.attempt > 1 ? `${step.attempt}×` : step.attempt === 0 ? "—" : "1"}</td>
        <td className="py-2.5 text-right font-mono text-xs text-ink-secondary">{seconds != null ? `${seconds}s` : "—"}</td>
        <td className="py-2.5 text-right font-mono text-xs text-ink-secondary">${Number(step.costUsd).toFixed(4)}</td>
      </tr>
      {/* An errored step expands its message inline — the actual debugging payload. */}
      {step.error && (
        <tr>
          <td colSpan={5} className="pb-2.5">
            <div className="rounded-lg bg-danger/[0.06] px-3 py-2 font-mono text-xs text-danger">{step.error}</div>
          </td>
        </tr>
      )}
    </>
  );
}
