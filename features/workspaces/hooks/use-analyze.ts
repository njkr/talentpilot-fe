"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { workspaceApi } from "../workspace.api";

export function useAnalyze(workspaceId: string) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    // Generate ONE key per logical click. React Query's mutationFn receives it so a
    // network-level retry of THIS call reuses the same key (won't double-charge).
    mutationFn: (idempotencyKey: string) => workspaceApi.analyze(workspaceId, idempotencyKey),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["credits"] }); // 21 charged -> update topbar
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      // 202 -> go straight to the progress screen with the runId.
      router.push(`/workspaces/${workspaceId}?run=${res.runId}`);
    },
  });
}
