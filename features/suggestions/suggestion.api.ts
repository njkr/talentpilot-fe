import { api } from "@/lib/api/client";
import type { AiSuggestion, ApplySuggestionsResult } from "./suggestion.types";

export const suggestionApi = {
  // No status filter — needs_info rows must come back alongside pending ones, or the whole
  // needs_info feature is invisible. Previously hardcoded { status: "pending" }, which hid them.
  list: (workspaceId: string) => api.get<AiSuggestion[]>(`/workspaces/${workspaceId}/suggestions`),
  apply: (workspaceId: string, suggestionIds: string[]) => api.post<ApplySuggestionsResult>(`/workspaces/${workspaceId}/suggestions/apply`, { suggestionIds }),
  // Confirmed live response shape: { rejected: number } (not void, though the UI doesn't need it).
  reject: (workspaceId: string, suggestionIds: string[]) => api.post<{ rejected: number }>(`/workspaces/${workspaceId}/suggestions/reject`, { suggestionIds }),
  // Returns the updated suggestion: flips to "pending" if the resubmitted text passes the
  // fabrication check, or stays "needs_info" with a refreshed missingFact/exampleValue if not.
  // 404s with "No needs_info suggestion with that id." if called on a non-needs_info suggestion.
  provideDetail: (workspaceId: string, suggestionId: string, newText: string) =>
    api.post<AiSuggestion>(`/workspaces/${workspaceId}/suggestions/${suggestionId}/provide-detail`, { newText }),
};
