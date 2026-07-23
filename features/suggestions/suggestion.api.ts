import { api } from "@/lib/api/client";
import type { AiSuggestion, ApplySuggestionsResult } from "./suggestion.types";

export const suggestionApi = {
  listPending: (workspaceId: string) => api.get<AiSuggestion[]>(`/workspaces/${workspaceId}/suggestions`, { status: "pending" }),
  apply: (workspaceId: string, suggestionIds: string[]) => api.post<ApplySuggestionsResult>(`/workspaces/${workspaceId}/suggestions/apply`, { suggestionIds }),
  // Confirmed live response shape: { rejected: number } (not void, though the UI doesn't need it).
  reject: (workspaceId: string, suggestionIds: string[]) => api.post<{ rejected: number }>(`/workspaces/${workspaceId}/suggestions/reject`, { suggestionIds }),
};
