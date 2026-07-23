"use client";

import { useQuery } from "@tanstack/react-query";
import { reportApi } from "../report.api";

export function useReport(workspaceId: string, active: boolean) {
  // A 409 REPORT_NOT_READY isn't retried — the global query client default already skips 4xx.
  return useQuery({
    queryKey: ["workspaces", workspaceId, "report"],
    queryFn: () => reportApi.get(workspaceId),
    enabled: active,
  });
}
