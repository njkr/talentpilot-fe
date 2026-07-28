// Confirmed live 2026-07-25: `GET /plans` does NOT exist (plain 404, absent from both the API
// doc's 44-endpoint reference and the Postman collection). There is no catalog endpoint listing
// price/feature data for plans other than the caller's own current one. The only place plan keys
// are confirmed is the checkout endpoint's own doc description ("`planKey` is `pro` or
// `ultimate`, never `free`") — so this union is the full real set, but carries no pricing/limits
// for the plans a free user doesn't already have. Never fabricate prices or feature lists here;
// Stripe's own Checkout page is the only real source for what a plan costs.
export type PlanKey = "free" | "pro" | "ultimate";

// Public GET /credit-packs shape, confirmed live 2026-07-26 — deliberately thinner than the admin
// AdminCreditPack type (features/admin/admin.types.ts): no stripeProductId/stripePriceId/active/
// createdAt/updatedAt, those are admin-only.
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  bestValue: boolean;
  displayOrder: number;
}

// Real shape confirmed live (curl) + Postman saved example, matching exactly. Richer than a bare
// Stripe mirror — already merged with the plan's own limits, so the billing page never needs a
// separate plan-lookup call for the CURRENT plan.
export interface Subscription {
  planKey: PlanKey;
  planName: string;
  monthlyCredits: number;
  maxResumes: number;
  maxWorkspaces: number;
  status: "active" | "past_due" | "canceled" | string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}
