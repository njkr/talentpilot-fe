import { api } from "@/lib/api/client";
import type { AtsReport } from "./report.types";

export const reportApi = {
  // 409 REPORT_NOT_READY (details: { status }) if no completed analysis run exists yet for this
  // workspace — confirmed real code in the backend's ErrorCode enum.
  get: (workspaceId: string) => api.get<AtsReport>(`/workspaces/${workspaceId}/report`),
  // Returns { queued: true } immediately — the new report lands asynchronously, poll GET .../report
  // (same pattern as Start Analysis). 409 NO_CHANGES_TO_RESCORE if the resume hasn't changed since
  // the last report (no credit side-effect). 402 INSUFFICIENT_CREDITS otherwise handled like analyze.
  rescore: (workspaceId: string, idempotencyKey: string) =>
    api.postIdempotent<{ queued: boolean }>(`/workspaces/${workspaceId}/rescore`, {}, idempotencyKey),
};
