"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { adminApi } from "../admin.api";

// A 403 (admin-role-but-not-allowlisted) isn't retried — the global query client default already
// skips 4xx (lib/query.ts).
export function useAdminRun(runId: string) {
  return useQuery({ queryKey: ["admin", "run", runId], queryFn: () => adminApi.getRun(runId) });
}

export function useDeadLetterQueue(queue: string) {
  return useQuery({ queryKey: ["admin", "dlq", queue], queryFn: () => adminApi.listDeadLetter(queue) });
}

export function useRetryDeadJob(queue: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => adminApi.retryDeadLetter(queue, jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dlq", queue] });
      toast("Job requeued", "success");
    },
  });
}

export function useAdminCosts(days: number) {
  return useQuery({ queryKey: ["admin", "costs", days], queryFn: () => adminApi.getCosts(days) });
}

export function usePromptVersions(key: string) {
  return useQuery({ queryKey: ["admin", "prompts", key], queryFn: () => adminApi.getPromptVersions(key) });
}

export function useActivatePrompt(key: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (version: number) => adminApi.activatePrompt(key, version),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "prompts", key] });
      toast("Prompt version activated — next runs use it immediately", "success");
    },
  });
}

export function useAuditLog(filters: { actorType?: string; action?: string }) {
  return useInfiniteQuery({
    queryKey: ["admin", "audit", filters],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => adminApi.listAudit({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
  });
}
