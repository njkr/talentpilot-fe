// ⚠️ SUPERSEDES the Sprint 10 note that used to be here: as of 2026-07-26 (Sprint 13's
// configurable-payments backend), `GET /plans` DOES exist now — confirmed live, returns the real
// plan catalog. As of 2026-07-27 (cancel/switch/interval), the real plan grid described below
// finally consumes it — see `Plan` further down.
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
// `pendingPlanKey` confirmed live 2026-07-27 (cancel/switch backend update) — null normally, set to
// the target plan's key when a downgrade is scheduled (switch defers a downgrade to the next
// renewal instead of applying immediately; an upgrade applies right away and pendingPlanKey stays
// null). `status` gained `trialing`/`incomplete` in the doc's guess but neither was observed live —
// kept as `string` fallback, same pattern as before.
export interface Subscription {
  planKey: PlanKey;
  planName: string;
  monthlyCredits: number;
  maxResumes: number;
  maxWorkspaces: number;
  status: "active" | "past_due" | "canceled" | string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  pendingPlanKey: string | null;
}

// Real values confirmed live 2026-07-27 via a VALIDATION_FAILED probe: Stripe's own convention
// (`month`/`year`), NOT the doc's guessed `'monthly' | 'yearly'` — those strings 400. Applies to
// both POST /payments/subscription/switch (required) and POST /payments/checkout (validated if
// present, confirmed via a second probe — though this env has no real yearly Stripe price
// configured for any plan yet, priceYearlyCents is 0 everywhere, so selecting "Yearly" will
// currently always hit the same NOT_FOUND "not available for checkout" case Sprint 10 already
// handles for monthly).
export type BillingInterval = "month" | "year";

// Public GET /plans shape, confirmed live 2026-07-26 (the day this endpoint first appeared) —
// deliberately thinner than the admin AdminPlan type (features/admin/admin.types.ts): FLAT
// maxResumes/maxWorkspaces (no nested `limits`, no `limits.regenPerDay` at all), no
// active/stripeProductId/stripePriceIds/createdAt/updatedAt. Only plans with active:true are
// returned (admin's list includes archived ones, this doesn't).
export interface Plan {
  id: string;
  key: PlanKey;
  name: string;
  description: string | null;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  monthlyCredits: number;
  maxResumes: number;
  maxWorkspaces: number;
  displayOrder: number;
}
