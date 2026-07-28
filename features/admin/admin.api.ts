import { api } from "@/lib/api/client";
import type { AdminRunDetail, DeadLetterJob, AdminCosts, PromptVersion, AuditEntry } from "./admin.types";

export const adminApi = {
  getRun: (runId: string) => api.get<AdminRunDetail>(`/admin/runs/${runId}`),
  listDeadLetter: (queue: string) => api.get<DeadLetterJob[]>(`/admin/queues/${queue}/dead-letter`),
  // Real response confirmed via Postman: { requeued: true }.
  retryDeadLetter: (queue: string, jobId: string) => api.post<{ requeued: boolean }>(`/admin/queues/${queue}/dead-letter/${jobId}/retry`),
  getCosts: (days: number) => api.get<AdminCosts>("/admin/costs", { days }),
  getPromptVersions: (key: string) => api.get<PromptVersion[]>(`/admin/prompts/${key}/versions`),
  // Real body confirmed via Postman: { version: number } — the sprint doc's own snippet sent an
  // empty body here, ignoring the version argument entirely; that was a real bug in the doc's own
  // code, not just an unconfirmed shape.
  activatePrompt: (key: string, version: number) => api.post<{ activated: boolean }>(`/admin/prompts/${key}/activate`, { version }),
  listAudit: (params: { actorType?: string; action?: string; cursor?: string }) => api.list<AuditEntry[]>("/admin/audit", params),
};
