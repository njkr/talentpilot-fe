"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/error";
import { adminApi } from "../admin.api";
import type { PlanInput, CreditPackInput, PaymentConfig, IntegrationProvider, AdminUserStatus } from "../admin.types";

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

// A Stripe-sync failure (bad key mid-request, network blip) can leave a plan/pack half-created —
// surfaced honestly via toast rather than a silent success, per the doc's own explicit caution.
function toastSaveError(err: unknown) {
  toast(err instanceof ApiError ? err.message : "Save failed — check Stripe connection", "error");
}

export function useAdminPlans() {
  return useQuery({ queryKey: ["admin", "plans"], queryFn: adminApi.listPlans });
}

export function useSavePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string } & Partial<PlanInput>) => (id ? adminApi.updatePlan(id, body) : adminApi.createPlan(body as PlanInput)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      qc.invalidateQueries({ queryKey: ["plans"] }); // public plan catalog, if anything ever caches it
      toast("Plan saved and synced to Stripe", "success");
    },
    onError: toastSaveError,
  });
}

export function useArchivePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.archivePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      toast("Plan archived", "success");
    },
    onError: toastSaveError,
  });
}

export function useAdminCreditPacks() {
  return useQuery({ queryKey: ["admin", "credit-packs"], queryFn: adminApi.listCreditPacks });
}

export function useSaveCreditPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string } & Partial<CreditPackInput>) =>
      id ? adminApi.updateCreditPack(id, body) : adminApi.createCreditPack(body as CreditPackInput),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "credit-packs"] });
      qc.invalidateQueries({ queryKey: ["credit-packs"] }); // the user-facing public list
      toast("Credit pack saved and synced to Stripe", "success");
    },
    onError: toastSaveError,
  });
}

export function useArchiveCreditPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.archiveCreditPack(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "credit-packs"] });
      qc.invalidateQueries({ queryKey: ["credit-packs"] });
      toast("Credit pack archived", "success");
    },
    onError: toastSaveError,
  });
}

// Reactivating an archived pack — confirmed live (2026-07-26) this creates a BRAND-NEW Stripe
// price even with no priceCents change (the "prices are immutable" rule applies to reactivation
// too), so it goes through the same PATCH {active:true} path as any other edit, not a bespoke
// "just flip a flag" call.
export function useActivateCreditPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.updateCreditPack(id, { active: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "credit-packs"] });
      qc.invalidateQueries({ queryKey: ["credit-packs"] });
      toast("Credit pack activated and synced to Stripe", "success");
    },
    onError: toastSaveError,
  });
}

export function useAdminPaymentConfig() {
  return useQuery({ queryKey: ["admin", "payment-config"], queryFn: adminApi.getPaymentConfig });
}

export function useUpdatePaymentConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<PaymentConfig>) => adminApi.updatePaymentConfig(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "payment-config"] });
      toast("Configuration saved", "success");
    },
    onError: toastSaveError,
  });
}

export function useAdminReferrals() {
  return useInfiniteQuery({
    queryKey: ["admin", "referrals"],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => adminApi.listReferrals({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
  });
}

export function useAdminReferralStats() {
  return useQuery({ queryKey: ["admin", "referral-stats"], queryFn: adminApi.getReferralStats });
}

export function useIntegrationsOverview() {
  return useQuery({ queryKey: ["admin", "integrations", "overview"], queryFn: adminApi.getIntegrationsOverview });
}

export function useIntegrationDaily(provider: IntegrationProvider, days: number) {
  return useQuery({ queryKey: ["admin", "integrations", provider, days], queryFn: () => adminApi.getIntegrationDaily(provider, days) });
}

export function useAdminUsers(filters: { search?: string; status?: AdminUserStatus | "all" }) {
  const apiFilters = { search: filters.search, status: filters.status === "all" ? undefined : filters.status };
  return useInfiniteQuery({
    queryKey: ["admin", "users", apiFilters],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => adminApi.listUsers({ ...apiFilters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast("Access revoked — takes effect on their next login or token refresh", "success");
    },
    onError: toastSaveError,
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast("Account reactivated", "success");
    },
    onError: toastSaveError,
  });
}
