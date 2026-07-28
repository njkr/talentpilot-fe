import { api } from "@/lib/api/client";
import type {
  AdminRunDetail,
  DeadLetterJob,
  AdminCosts,
  PromptVersion,
  AuditEntry,
  AdminPlan,
  PlanInput,
  AdminCreditPack,
  CreditPackInput,
  PaymentConfig,
  AdminReferralRow,
  AdminReferralStats,
  AdminIntegrationsOverview,
  AdminIntegrationDaily,
  IntegrationProvider,
  AdminUserRow,
  AdminUserStatus,
} from "./admin.types";

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

  // Includes inactive/archived plans (confirmed live) — GET /plans (public) doesn't.
  listPlans: () => api.get<AdminPlan[]>("/admin/plans"),
  createPlan: (body: PlanInput) => api.post<AdminPlan>("/admin/plans", body),
  updatePlan: (id: string, body: Partial<Omit<PlanInput, "key">>) => api.patch<AdminPlan>(`/admin/plans/${id}`, body),
  // Never hard-deleted server-side (confirmed live) — archives the Stripe product + every price,
  // sets active=false.
  archivePlan: (id: string) => api.del<void>(`/admin/plans/${id}`),

  listCreditPacks: () => api.get<AdminCreditPack[]>("/admin/credit-packs"),
  createCreditPack: (body: CreditPackInput) => api.post<AdminCreditPack>("/admin/credit-packs", body),
  updateCreditPack: (id: string, body: Partial<CreditPackInput> & { active?: boolean }) => api.patch<AdminCreditPack>(`/admin/credit-packs/${id}`, body),
  archiveCreditPack: (id: string) => api.del<void>(`/admin/credit-packs/${id}`),

  getPaymentConfig: () => api.get<PaymentConfig>("/admin/payment-config"),
  // Only send changed fields — confirmed live the endpoint applies a partial merge, and reads are
  // cached 60s server-side (PaymentConfigService) but the editing admin's own next GET is always
  // fresh since the cache is busted immediately on write.
  updatePaymentConfig: (body: Partial<PaymentConfig>) => api.patch<PaymentConfig>("/admin/payment-config", body),

  // Cursor-paginated, newest first (confirmed live, same shape as GET /admin/audit).
  listReferrals: (params: { cursor?: string }) => api.list<AdminReferralRow[]>("/admin/referrals", params),
  getReferralStats: () => api.get<AdminReferralStats>("/admin/referrals/stats"),

  getIntegrationsOverview: () => api.get<AdminIntegrationsOverview>("/admin/integrations"),
  getIntegrationDaily: (provider: IntegrationProvider, days: number) => api.get<AdminIntegrationDaily>(`/admin/integrations/${provider}/daily`, { days }),

  listUsers: (params: { cursor?: string; search?: string; status?: AdminUserStatus; days?: number }) => api.list<AdminUserRow[]>("/admin/users", params),
  suspendUser: (id: string) => api.post<{ status: AdminUserStatus }>(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => api.post<{ status: AdminUserStatus }>(`/admin/users/${id}/activate`),
};
