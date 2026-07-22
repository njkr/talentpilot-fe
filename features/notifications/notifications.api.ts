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
};
