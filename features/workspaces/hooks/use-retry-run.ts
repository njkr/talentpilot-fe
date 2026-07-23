"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "../workspace.api";

export function useRetryRun(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => workspaceApi.retryRun(runId),
    onSuccess: () => {
      // Retry re-queues the SAME run (confirmed live: id unchanged, completed steps untouched,
      // progress preserved). useRunProgress is keyed on runId, so invalidating here is enough —
      // its own polling/SSE picks the run back up as it moves queued -> running -> terminal.
      qc.invalidateQueries({ queryKey: ["workspaces", workspaceId] });
    },
  });
}
