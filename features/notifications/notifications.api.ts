import { api } from "@/lib/api/client";

// Shape confirmed against the live backend + the Postman collection's saved example — note the
// real field is `readAt` (nullable timestamp), not a `read` boolean; `type` uses the same
// dot-notation event names as the SSE pipeline stream (e.g. "run.completed", "run.failed"); and
// there's no `deepLink` field — the frontend builds the link itself from `workspaceId`.
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: { workspaceId?: string; runId?: string; status?: string };
  readAt: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () => api.list<Notification[]>("/notifications"),
  unreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<void>("/notifications/read-all"),
  // Confirmed live 2026-07-25: real response is { emailDisabled: string[] } for BOTH GET and PUT
  // (PUT echoes the full updated object) — the Postman collection's saved examples show a bare
  // array for GET and `data: null` for PUT instead, which don't match what the running backend
  // actually returns; live wins over a possibly-stale saved example.
  getPreferences: () => api.get<{ emailDisabled: string[] }>("/notifications/preferences"),
  updatePreferences: (emailDisabled: string[]) => api.put<{ emailDisabled: string[] }>("/notifications/preferences", { emailDisabled }),
};

// Real notification `type` values confirmed live in this account (dot-notation, matching the SSE
// pipeline event names): run.completed, run.failed, gdpr.export_ready. A sprint doc's guessed
// snake_case set (analysis_complete/analysis_failed/credits_low/payment) does not match ANY real
// type — toggling those off would silently do nothing, since PUT accepts arbitrary strings with
// no server-side enum validation. Only list types with real, observed evidence here.
export const NOTIFICATION_TYPES: { type: string; label: string; description: string }[] = [
  { type: "run.completed", label: "Analysis complete", description: "When an analysis finishes" },
  { type: "run.failed", label: "Analysis failed", description: "When an analysis needs your attention" },
  { type: "gdpr.export_ready", label: "Data export ready", description: "When your requested data export is ready" },
];
