import { api } from "@/lib/api/client";
import type { PlanKey, Subscription } from "./payment.types";

export const paymentApi = {
  getSubscription: () => api.get<Subscription>("/payments/subscription"),
  // Idempotency-Key: one fresh id per logical click (crypto.randomUUID(), generated at click
  // time) — same rule as analyze (Sprint 5). 404 NOT_FOUND if the plan has no Stripe price
  // configured in this environment ("Plan \"pro\" is not available for checkout."); 400
  // IDEMPOTENCY_KEY_REQUIRED if the header is missing (shouldn't happen — this wrapper always
  // sends one, kept as a real, confirmed code rather than dead documentation).
  checkout: (planKey: PlanKey, idempotencyKey: string) => api.postIdempotent<{ url: string }>("/payments/checkout", { planKey }, idempotencyKey),
  // 404 NOT_FOUND for a free-plan user with no Stripe customer on file yet.
  portal: () => api.post<{ url: string }>("/payments/portal"),
};
