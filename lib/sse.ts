import { api } from "./api/client";

// Confirmed live 2026-07-23 against a real running pipeline: the backend sends NAMED SSE events
// (`event: snapshot`, `event: step.started`, ...), not the default unnamed "message" event a
// plain `es.onmessage` handler would catch — that handler NEVER fires for any of these. Each
// named type needs its own `addEventListener`. Also: `snapshot`'s data has no `type` field (it's
// redundant with the event name), while step/run events DO include one; and the ticket-invalid
// error frame (`event: error`) is a PLAIN STRING payload, not JSON — so parsing must not assume
// JSON and throw away a real message.
const KNOWN_EVENT_TYPES = ["snapshot", "step.started", "step.completed", "step.skipped", "step.failed", "run.completed", "run.failed", "ping", "error"] as const;

export interface RunEvent {
  type: (typeof KNOWN_EVENT_TYPES)[number];
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
 * NOTE on the 'error' event name: the SSE spec gives the browser's own native connection-error
 * event and any server-sent `event: error` frame the exact same EventSource event type — there is
 * no way to tell them apart from the frontend. In practice this is harmless here: an invalid/dead
 * ticket triggers this same `onerror` path the caller already uses for reconnect-then-poll logic,
 * so it still degrades correctly to polling, just after a couple of wasted retry attempts against
 * a ticket that will never work — not worth a special case.
 *
 * Returns an unsubscribe function. The caller (features/workspaces/hooks/use-run-progress.ts) owns
 * reconnection + poll fallback.
 */
export async function openRunStream(runId: string, onEvent: (e: RunEvent) => void, onError: () => void): Promise<() => void> {
  // 1. mint the ticket (authenticated normally)
  const { ticket } = await api.post<{ ticket: string; expiresInSec: number }>(`/workspaces/runs/${runId}/stream-ticket`);

  // 2. open the stream with the ticket
  const url = `${process.env.NEXT_PUBLIC_API_URL}/workspaces/runs/${runId}/stream?ticket=${ticket}`;
  const es = new EventSource(url); // no withCredentials needed — the ticket IS the auth

  for (const type of KNOWN_EVENT_TYPES) {
    es.addEventListener(type, (msg: MessageEvent<string>) => {
      let data: unknown = msg.data;
      try {
        data = JSON.parse(msg.data);
      } catch {
        // not JSON (e.g. the plain-string 'error' message) — forward the raw string as-is
      }
      onEvent({ type, data });
    });
  }

  es.onerror = () => {
    es.close();
    onError();
  };

  return () => es.close();
}
