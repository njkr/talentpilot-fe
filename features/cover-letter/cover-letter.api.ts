import { api } from "@/lib/api/client";
import type { CoverLetter, RegenerateCoverLetterBody } from "./cover-letter.types";

export const coverLetterApi = {
  // Confirmed live: 404 NOT_FOUND (not a distinct "not ready" code) when no letter exists yet.
  get: (workspaceId: string) => api.get<CoverLetter>(`/workspaces/${workspaceId}/cover-letter`),
  regenerate: (workspaceId: string, body: RegenerateCoverLetterBody) => api.post<CoverLetter>(`/workspaces/${workspaceId}/cover-letter/regenerate`, body),
};
