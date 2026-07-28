import { api } from "@/lib/api/client";
import type { PlanKey, Subscription, CreditPack, Plan, BillingInterval } from "./payment.types";

export const paymentApi = {
  getSubscription: () => api.get<Subscription>("/payments/subscription"),
  // No auth required (public catalog, confirmed live 2026-07-26). Only active:true plans.
  listPlans: () => api.get<Plan[]>("/plans"),
  // Idempotency-Key: one fresh id per logical click (crypto.randomUUID(), generated at click
  // time) — same rule as analyze (Sprint 5). 404 NOT_FOUND if the plan has no Stripe price
  // configured in this environment ("Plan \"pro\" is not available for checkout."); 400
  // IDEMPOTENCY_KEY_REQUIRED if the header is missing (shouldn't happen — this wrapper always
  // sends one, kept as a real, confirmed code rather than dead documentation). Confirmed live
  // 2026-07-27: an already-subscribed user hitting this gets a real, distinct 409
  // ALREADY_SUBSCRIBED ("...use the switch-plan endpoint to change plans, not checkout.") — the
  // backend's own backstop against a double subscription; PlanCards routes existing subscribers to
  // `switch` so this should never actually fire from this UI, but it's real and confirmed either way.
  checkout: (planKey: PlanKey, interval: BillingInterval, idempotencyKey: string) => api.postIdempotent<{ url: string }>("/payments/checkout", { planKey, interval }, idempotencyKey),
  // 404 NOT_FOUND for a free-plan user with no Stripe customer on file yet.
  portal: () => api.post<{ url: string }>("/payments/portal"),

  // Confirmed live 2026-07-27: an UPGRADE (higher-ranked plan) applies immediately and
  // pendingPlanKey stays null; a DOWNGRADE schedules for the next renewal instead (planKey stays
  // the current plan, pendingPlanKey becomes the target) — reproduced exactly as the doc described.
  // ⚠️ Switching to the plan you're ALREADY effectively on (matching `planKey`, not `pendingPlanKey`)
  // is rejected: 400 VALIDATION_FAILED with an oddly-shaped `fields: {"You": ["You are already on
  // the \"x\" plan."]}` — the useful message is IN `fields`, not the generic top-level `message`
  // ("Validation failed."). useSwitchPlan's onError unpacks this specifically.
  // ⚠️ FIXED 2026-07-27, re-confirmed live: switching to your CURRENT plan WHILE a downgrade is
  // pending now succeeds and clears the pending change (`pendingPlanKey → null`) — this used to be
  // rejected the same way as switching to a truly-unchanged plan; not anymore. PlanCards still
  // routes this specific case through `clearPendingChange` instead (below) rather than `switchPlan`,
  // since the intent ("undo the scheduled change") is clearer in the code that way, even though
  // both now work.
  switchPlan: (planKey: PlanKey, interval: BillingInterval) => api.post<Subscription>("/payments/subscription/switch", { planKey, interval }),
  // ⚠️ FIXED 2026-07-27, re-confirmed live (previously 500'd INTERNAL_ERROR while a switch was
  // pending — see CLAUDE.md's "Billing: cancel / switch / packs" section for that history). Cancel
  // now succeeds in every state, and cancelling while a downgrade was pending clears the pending
  // change too (`pendingPlanKey → null`, `cancelAtPeriodEnd → true`) — cancelling the whole
  // subscription reasonably supersedes a scheduled plan change. CurrentPlanCard's old
  // disable-cancel-while-pending workaround is removed now that the underlying bug is fixed.
  cancel: () => api.post<Subscription>("/payments/subscription/cancel"),
  // Confirmed live: NO_SUBSCRIPTION_TO_RESUME (400) is a real, distinct code for "nothing scheduled
  // to cancel" — shouldn't be reachable from this UI (Resume only renders when cancelAtPeriodEnd is
  // true) but added to the error catalogue since it's real.
  resume: () => api.post<Subscription>("/payments/subscription/resume"),
  // ⚠️ Confirmed live 2026-07-27: undoes a pending downgrade without touching cancellation.
  // `NO_PENDING_CHANGE` (the doc's guessed code for "nothing to clear") does NOT exist — the
  // backend reuses the existing `NO_SUBSCRIPTION_TO_RESUME` code for this case too (confirmed by
  // actually calling this with nothing pending), distinguished only by message text
  // ("There is no pending plan change to cancel."). Never switch on that text — the shared code is
  // enough to route both "nothing to resume" and "nothing pending" to the same generic handling.
  clearPendingChange: () => api.post<Subscription>("/payments/subscription/clear-pending-change"),

  // No auth required (public catalog, confirmed live).
  listCreditPacks: () => api.get<CreditPack[]>("/credit-packs"),
  // mode: payment (one-time), NOT a subscription. Confirmed live: 403 FEATURE_DISABLED (details
  // {feature:"credit_packs"}) if admin has payment_config.creditPacksEnabled off; 404 NOT_FOUND if
  // the pack doesn't exist or isn't active. Same Idempotency-Key rule as checkout above.
  buyCreditPack: (packId: string, idempotencyKey: string) => api.postIdempotent<{ url: string }>(`/credit-packs/${packId}/checkout`, {}, idempotencyKey),
};
