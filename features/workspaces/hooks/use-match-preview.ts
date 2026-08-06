"use client";

import { useQuery } from "@tanstack/react-query";
import { matchApi } from "../match.api";

// A useQuery, not the useCheckMatch mutation (which stays for AnalyzeButton's own imperative
// on-click flow) — this must reactively refetch whenever the resume/job selection changes.
// matchApi.check is a POST under the hood but a read/compute operation with no server-side
// mutation, so caching it as a query is correct.
export function useMatchPreview(resumeId: string | null, jobDescriptionId: string | null) {
  return useQuery({
    queryKey: ["match-preview", resumeId, jobDescriptionId],
    queryFn: () => matchApi.check(resumeId!, jobDescriptionId!),
    enabled: !!resumeId && !!jobDescriptionId,
    staleTime: 5 * 60 * 1000,
  });
}
