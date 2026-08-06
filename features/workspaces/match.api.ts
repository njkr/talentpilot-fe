import { api } from "@/lib/api/client";
import type { MatchResult } from "./match.types";

export const matchApi = {
  // Confirmed live: 201 Created, no request body, no Idempotency-Key, NOT credit-gated — cheap
  // enough to call before a user spends analysis credits. Only documented error: 409
  // JD_NOT_ANALYZED (details: { status }), practically unreachable here since a workspace's own
  // jobDescriptionId always already points to an analyzed JD (CreateWorkspaceDialog only allows
  // picking analyzed jobs).
  check: (resumeId: string, jobDescriptionId: string) => api.post<MatchResult>(`/resumes/${resumeId}/match/${jobDescriptionId}`),
};
