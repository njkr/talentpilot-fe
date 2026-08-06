"use client";

import { useMutation } from "@tanstack/react-query";
import { matchApi } from "../match.api";

// Deliberately a mutation, not a query — must only fire when the user actually clicks Analyze,
// never just because the "Ready to analyze" card mounted (the endpoint's own doc flags call
// volume as a real cost to respect, even though it's not credit-gated). Stateless advisory check
// — nothing else in the app reads or caches its result, so no cache invalidation is needed.
export function useCheckMatch() {
  return useMutation({
    mutationFn: ({ resumeId, jobDescriptionId }: { resumeId: string; jobDescriptionId: string }) => matchApi.check(resumeId, jobDescriptionId),
  });
}
