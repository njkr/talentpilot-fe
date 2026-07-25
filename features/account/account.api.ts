import { api } from "@/lib/api/client";

export const accountApi = {
  // Confirmed live: 200 with `data: null` — queues a background job, delivered as a
  // `gdpr.export_ready` notification (with the actual signed download link embedded in the
  // notification's message text) once ready. Nothing meaningful to poll here.
  exportData: () => api.post<null>("/gdpr/export"),
  // Confirmed by the API doc: a token used after this comes back TOKEN_INVALID on the very next
  // call — every session is revoked immediately, even though the hard purge waits 30 days.
  deleteAccount: () => api.del<void>("/users/me"),
};
