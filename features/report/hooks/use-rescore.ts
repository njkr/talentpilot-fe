"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportApi } from "../report.api";

// Debits credits synchronously; the new report lands asynchronously via useRescorePoll. Don't
// invalidate the report query here — that would just refetch the still-old report.
export function useRescore(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey: string) => reportApi.rescore(workspaceId, idempotencyKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credits"] }),
  });
}
