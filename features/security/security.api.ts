import { api } from "@/lib/api/client";
import type { Session } from "./security.types";

export const securityApi = {
  // Confirmed live: an unbounded array, not cursor-paginated — this dev account alone has 50+
  // entries from repeated test logins, so the UI must handle a long list gracefully.
  listSessions: () => api.get<Session[]>("/auth/sessions"),
  // 204 on success; 404 NOT_FOUND for an already-revoked/unknown familyId.
  revokeSession: (familyId: string) => api.del<void>(`/auth/sessions/${familyId}`),
};
