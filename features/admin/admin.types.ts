// All shapes below confirmed LIVE 2026-07-25 against a real admin account (role:admin +
// ADMIN_ALLOWED_EMAILS). Two real corrections from the pre-verification draft of this file:
// 1. AdminStep has NO `durationMs` field — duration must be computed from startedAt/finishedAt,
//    same as the run-level duration already was.
// 2. PromptVersion DOES include `model`, `createdAt`, and `systemTemplate` — the earlier
//    Postman-only guess wrongly concluded these didn't exist, because Postman's saved example
//    was a MORE abbreviated illustrative snippet than the real response, not a complete one.
//    Lesson: an abbreviated example proves a field's absence even less than it proves presence —
//    don't treat "not shown in Postman" as "doesn't exist" the way "shown with a different name in
//    Postman" can be treated as a real rename.

export interface AdminStep {
  id: string;
  name: string;
  status: string;
  attempt: number;
  outputRef: string | null; // added Sprint 7 specifically so an inspector can jump to what a step produced
  costUsd: string;
  error: string | null;
  errorType: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface AdminRunDetail {
  run: {
    id: string;
    workspaceId: string;
    userId: string;
    status: string;
    progress: number;
    creditsCharged: number;
    creditsRefunded: number;
    totalCostUsd: string;
    error: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    failedSteps: string[];
  };
  steps: AdminStep[];
}

// Real shape confirmed live — the backend exposes the raw BullMQ job object, not a custom-shaped
// DTO (attemptsMade/failedReason/timestamp are BullMQ's own field names).
export interface DeadLetterJob {
  id: string;
  name: string;
  data: Record<string, unknown>;
  attemptsMade: number;
  failedReason: string;
  timestamp: number; // raw Unix ms, NOT an ISO string
}

// Real shape confirmed live — matches the Postman example exactly, INCLUDING the absence of any
// "failure rate" data: no failureRate/model/failure_rate field anywhere in the real response, so
// the sprint doc's "failure rate by feature" panel isn't built (there's nothing to show).
// `byDay.calls`/`byDay.errors` added 2026-07-28 — confirmed live, both strings (raw SQL aggregate
// output), same convention already used by `byFeature.calls`.
export interface AdminCosts {
  since: string;
  byFeature: { feature: string; costUsd: string; calls: string }[];
  byDay: { day: string; costUsd: string; calls: string; errors: string }[];
  topUsers: { userId: string; costUsd: string }[]; // no `calls` field on this one, confirmed
}

// Real shape confirmed live — richer than either the sprint doc's guess or Postman's abbreviated
// example: `model` and `createdAt` are real, and `systemTemplate` (the actual, often
// multi-paragraph prompt text) IS returned, making a real prompt preview buildable after all.
export interface PromptVersion {
  key: string;
  version: number;
  model: string;
  isActive: boolean;
  changeNote: string | null;
  systemTemplate: string;
  createdAt: string;
}

// Real shape confirmed live. `resourceId` and `ip` are both real (DEVELOPMENT-NOTES.md's own Sprint 9-11 doc
// prose already said resourceId was added as a real column; ip is now directly confirmed too).
export interface AuditEntry {
  id: string;
  userId: string | null;
  actorType: "admin" | "user" | "system" | string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  ip?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

// ── Configurable payments (Sprint 13, confirmed live 2026-07-26) ──────────────────────────────
// This whole feature area is absent from docs/API-Full-Documentation.txt entirely, and the
// Postman collection only carries REQUEST examples (create/update bodies) with zero saved
// response bodies — the first time in this project neither a live backend nor a doc/Postman
// response example was available at the start. Every shape below was pulled directly off the
// running backend (role:admin + allowlisted account) before writing any UI, same standard as
// every other sprint, just via curl instead of a saved example.

// Richer than the PUBLIC GET /plans shape (features/payments/payment.types.ts's CreditPack
// sibling, `Plan`, isn't defined there — public /plans returns flat maxResumes/maxWorkspaces with
// NO limits.regenPerDay, active, stripeProductId, or stripePriceIds at all). Admin-only fields
// confirmed live: stripePriceIds.yearly can be the literal empty string "" (not just absent) on a
// plan whose yearly price was never actually configured — treat "" as "no yearly price" same as
// undefined, don't render it as a real price id.
export interface AdminPlan {
  id: string;
  key: string;
  name: string;
  description: string | null;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  monthlyCredits: number;
  limits: { maxResumes: number; maxWorkspaces: number; regenPerDay: number };
  stripeProductId: string | null;
  stripePriceIds: { monthly?: string; yearly?: string };
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanInput {
  key: string; // immutable after create — omit on update
  name: string;
  description?: string;
  priceMonthlyCents: number;
  priceYearlyCents: number;
  monthlyCredits: number;
  limits: { maxResumes: number; maxWorkspaces: number; regenPerDay: number };
  displayOrder: number;
}

// Confirmed live. `stripePriceId` is SINGULAR (one `mode: payment` price, not a monthly/yearly
// pair) — credit packs are one-time purchases, unlike plans. Also confirmed live: toggling
// `active` on an archived pack back to true creates a BRAND NEW Stripe price (the old one stays
// archived) even with no priceCents change — same "prices are immutable" rule PATCH's own
// description states for a real price edit, just triggered by reactivation too.
export interface AdminCreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
  active: boolean;
  displayOrder: number;
  bestValue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditPackInput {
  name: string;
  credits: number;
  priceCents: number;
  displayOrder?: number;
  bestValue?: boolean;
}

// Confirmed live exactly — every field the doc's form guessed is real, plus id/updatedAt/updatedBy
// which the doc's own type didn't list but the real response includes.
export interface PaymentConfig {
  id: number;
  signupCreditGrant: number;
  referrerReward: number;
  refereeReward: number;
  referralQualifyingEvent: "signup" | "email_verified" | "first_analysis" | "first_payment" | string;
  maxReferralRewardsPerUser: number;
  analyzeCost: number;
  coverLetterRegenCost: number;
  interviewFeedbackCost: number;
  referralsEnabled: boolean;
  creditPacksEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

// Confirmed live by actually registering a throwaway account with a real ?ref= code and reading
// it back here. ⚠️ `status` real value observed: "signed_up" — NOT the doc's guessed
// invited/qualified/rewarded vocabulary (those are the STATS bucket names from GET /referrals/me,
// not the row's own enum). The value after the referee completes the qualifying event (first
// analysis, per payment_config) was never observed live — email verification blocked driving the
// test account further. Render defensively (humanizeReferralStatus below) rather than a hardcoded
// switch that would silently show nothing for an unconfirmed value.
export interface AdminReferralRow {
  id: string;
  referrerId: string;
  refereeId: string | null;
  refereeEmail: string | null;
  status: string;
  rewardGranted: boolean;
  qualifiedAt: string | null;
  createdAt: string;
}

export function humanizeReferralStatus(status: string): string {
  const known: Record<string, string> = { signed_up: "Signed up", qualified: "Qualified", rewarded: "Rewarded" };
  return known[status] ?? status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

// Confirmed live.
export interface AdminReferralStats {
  totalInvited: number;
  totalQualified: number;
  totalCreditsPaid: number;
}

// ── Third-party integration usage tracking (2026-07-28) ────────────────────────────────────────
export const INTEGRATION_PROVIDERS = ["openai", "resend", "tavily", "stripe", "s3"] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

// GET /admin/integrations — last-24h snapshot, all 5 providers in one call. Confirmed live:
// `calls`/`errors` are NUMBERS here — unlike the per-provider daily endpoint below, which uses the
// same field names for STRINGS. `costUsd` is present ONLY on the `openai` row; the key is genuinely
// absent (not null) on the other four — don't render a $0.00/blank cost cell for them.
export interface AdminIntegrationsOverview {
  since: string;
  providers: { provider: IntegrationProvider; calls: number; errors: number; costUsd?: string }[];
}

// GET /admin/integrations/:provider/daily?days=N — one provider's per-day history. Confirmed live:
// `calls`/`errors`/`costUsd` are all STRINGS (raw SQL aggregate), and `costUsd` is absent for
// non-openai providers here too (confirmed by actually calling this for "resend", not just assumed
// by symmetry with the overview). `provider` path param validated server-side against
// INTEGRATION_PROVIDERS — anything else 400s VALIDATION_FAILED with the message under
// `error.fields.Unknown[0]` (a plain BadRequestException(string), not a dedicated field name) —
// unreachable from a UI that only ever sends values from a hardcoded provider Select.
export interface AdminIntegrationDaily {
  provider: IntegrationProvider;
  since: string;
  days: { day: string; calls: string; errors: string; costUsd?: string }[];
}

// ── Learning roadmap: admin-configurable affiliate links (2026-08-03) ─────────────────────────
// Confirmed live against the running backend before building (list, {query} validation 400,
// duplicate-default 409, and — since Postman's saved collection had no success example for it —
// PATCH's response shape, which mirrors Create's exactly: the full updated row).
export const AFFILIATE_LINK_RESOURCE_TYPES = ["documentation", "course", "book", "project", "other"] as const;
export type AffiliateLinkResourceType = (typeof AFFILIATE_LINK_RESOURCE_TYPES)[number];

// `keyword: null` = the default template for that resourceType (DB-enforced: at most one per
// type — a second 409s ALREADY_EXISTS). `priority` is a plain number ranking overlapping keyword
// matches (confirmed live: 0 for a default, 10 for a real keyword override — higher outranks).
// ⚠️ This resourceType set does NOT match LearningItem.resourceType (features/learning) — that's a
// real backend inconsistency (article/video roadmap items can never get an affiliateUrl;
// project/other templates can never match a real item), not something to unify from here.
export interface AdminAffiliateLink {
  id: string;
  resourceType: AffiliateLinkResourceType;
  keyword: string | null;
  urlTemplate: string;
  label: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateLinkInput {
  resourceType: AffiliateLinkResourceType;
  keyword?: string;
  urlTemplate: string;
  label: string;
  active?: boolean;
  priority?: number;
}

// ── Admin user directory (2026-07-28) ───────────────────────────────────────────────────────
export type AdminUserStatus = "active" | "suspended" | "deleted";

export interface AdminUserRow {
  id: string;
  email: string;
  role: "user" | "admin";
  status: AdminUserStatus;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null; // nullability to be confirmed live once the backend is reachable
  planKey: string; // "free" default for no subscription row
  planName: string; // "Free" default
  totalSpendUsd: string; // raw SQL aggregate — string, same convention as AdminCosts.byFeature.costUsd
  spendLastNDaysUsd: string; // fetched, NOT rendered — no `days` filter control was requested
  resumeCount: number;
  coverLetterCount: number;
  referrals: { invited: number; qualified: number };
}
