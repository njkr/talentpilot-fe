import { api } from "./api/client";

export interface RunEvent {
  type: "snapshot" | "run.started" | "step.started" | "step.completed" | "step.failed" | "run.completed" | "run.failed" | "ping";
  data: unknown;
}

/**
 * Opens an authenticated SSE stream for a pipeline run.
 *
 * WHY THE TICKET: the browser's EventSource API cannot set request headers — there is no way to
 * send `Authorization: Bearer ...`. Putting the real access token in the URL would leak it into
 * server logs, proxy logs, and browser history. So the backend issues a 60-second, single-use
 * ticket: we POST for it with normal auth, then open the stream with the ticket in the query
 * string. Leaking a ticket costs read access to one run's progress for under a minute.
 *
 * Returns an unsubscribe function. The caller (a React hook in Sprint 5) owns reconnection + poll
 * fallback.
 */
export async function openRunStream(runId: string, onEvent: (e: RunEvent) => void, onError: () => void): Promise<() => void> {
  // 1. mint the ticket (authenticated normally)
  const { ticket } = await api.post<{ ticket: string; expiresInSec: number }>(`/workspaces/runs/${runId}/stream-ticket`);

  // 2. open the stream with the ticket
  const url = `${process.env.NEXT_PUBLIC_API_URL}/workspaces/runs/${runId}/stream?ticket=${ticket}`;
  const es = new EventSource(url); // no withCredentials needed — the ticket IS the auth

  es.onmessage = (msg) => {
    try {
      const parsed = JSON.parse(msg.data);
      onEvent({ type: parsed.type ?? "ping", data: parsed });
    } catch {
      // ignore malformed frames
    }
  };
  es.onerror = () => {
    es.close();
    onError();
  };

  return () => es.close();
}
