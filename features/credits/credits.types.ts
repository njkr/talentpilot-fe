// Confirmed live 2026-07-25 (curl + Postman saved example, matching exactly): NO `balanceAfter`
// field — the sprint doc's ledger UI design assumed a running per-row balance that this endpoint
// simply does not return. Don't compute/display one client-side either (this account's live
// history has out-of-order refund rows from repeated retries, so summing amount deltas backwards
// would NOT reconstruct a trustworthy historical balance).
export interface CreditLedgerEntry {
  id: string;
  amount: number; // negative = spend, positive = credit
  reason: string; // see CREDIT_REASON_LABELS — real values observed exceed any doc's guessed enum
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

// Real reason values confirmed live in this account: analyze, cover_letter_regenerate, refund,
// retry_reversal, admin_adjust. Plus confirmed via Postman saved example: signup_bonus. Plus named
// in the API doc's own prose (not yet observed live in this account): monthly_refill, purchase.
// `reason` is typed as `string`, not a union, specifically because this list has already grown
// past every sprint doc's guess once — humanizeReason() falls back to a generic title-case for
// anything not in this map rather than assuming the map is exhaustive.
const CREDIT_REASON_LABELS: Record<string, string> = {
  signup_bonus: "Signup bonus",
  analyze: "Analysis run",
  cover_letter_regenerate: "Cover letter regenerated",
  refund: "Refund",
  retry_reversal: "Retry reversal",
  admin_adjust: "Admin adjustment",
  monthly_refill: "Monthly refill",
  purchase: "Plan purchase",
};

export function humanizeReason(reason: string): string {
  return CREDIT_REASON_LABELS[reason] ?? reason.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}
