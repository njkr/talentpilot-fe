import { api } from "@/lib/api/client";
import type { AtsReport } from "./report.types";

export const reportApi = {
  // 409 REPORT_NOT_READY (details: { status }) if no completed analysis run exists yet for this
  // workspace — confirmed real code in the backend's ErrorCode enum.
  get: (workspaceId: string) => api.get<AtsReport>(`/workspaces/${workspaceId}/report`),
};
