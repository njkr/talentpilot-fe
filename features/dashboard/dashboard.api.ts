import { api } from "@/lib/api/client";

// Base shape confirmed live against GET /dashboard (2026-07-22) — flatter than a first guess would
// suggest: no plan.limits object, resumes carries its own {count,limit}, workspaces has no limit
// field at all (only totals/breakdown + the 5 most recent).
//
// Insight fields (scoreInsight/creditInsight/topGaps/activity/attention/actionItems) added and
// confirmed live 2026-07-27, from the SAME batched /dashboard response — still one request, no
// fan-out. ⚠️ The "Dashboard Insights" sprint doc that introduced them guessed an entirely
// different, cleaner-looking shape for the PRE-EXISTING fields above (`credits` instead of
// `creditBalance`, `plan.limits.{maxResumes,maxWorkspaces}` instead of `plan.{status,
// monthlyCredits}`, a flat `counts`/`recentWorkspaces` instead of the nested `resumes`/
// `workspaces.recent` shape) — all wrong, re-guessing a shape this project already confirmed live
// in Sprint 2 without checking DEVELOPMENT-NOTES.md's own Sprint 2 section first (the exact lesson Sprint 11
// already flagged: check an earlier sprint's harder-won ground truth before trusting a new doc's
// claim about a system it already covers). Only the genuinely NEW fields below are real additions;
// every pre-existing field name is untouched from the Sprint 2 shape.
//
// `resumes.limit: 1000` on the `ultimate` plan is NOT a backend bug (the doc's own closing note
// flagged it as one) — it's real, already-confirmed plan config from the "Configurable payments"
// work: `ultimate`'s maxResumes/maxWorkspaces were deliberately changed from -1 (unlimited) to
// 1000 in this dev environment (see DEVELOPMENT-NOTES.md's "Billing: cancel / switch / packs" section).
export interface DashboardData {
  creditBalance: number;
  plan: { key: string; name: string; status: string; monthlyCredits: number };
  resumes: { count: number; limit: number };
  workspaces: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
    recent: Array<{
      id: string;
      name: string;
      status: "created" | "queued" | "processing" | "completed" | "partial" | "failed";
      updatedAt: string;
      // Real field, confirmed live — null when the workspace has no scored report yet (e.g. still
      // running, or failed before scoring). Every recent item in this dev account happened to have
      // a real number, so the null case is defensive, not directly observed.
      score: number | null;
    }>;
  };
  unreadNotifications: number;

  // Real shape confirmed live, matches the sprint doc's guess exactly. `trend` is one point PER
  // RUN, not per day — two runs on the same date produce two entries with the same `date` (seen
  // live: two 2026-07-23 entries, scores 57 and 23). Not pre-sorted by date in the observed
  // response either — sort client-side before charting if strict chronological order matters.
  scoreInsight: {
    latestScore: number | null;
    averageScore: number | null;
    bestScore: number | null;
    trend: { date: string; score: number }[];
  };
  // Real shape confirmed live, matches the sprint doc's guess exactly.
  creditInsight: {
    balance: number;
    spentLast30Days: number;
    grantedLast30Days: number;
    monthlyAllowance: number;
    runsRemaining: number;
  };
  // Real shape confirmed live, matches the sprint doc's guess exactly.
  topGaps: { keyword: string; missCount: number }[];
  // Real shape confirmed live, matches the sprint doc's guess exactly — 14 entries, oldest first,
  // every date present even with 0 runs (no gaps to fill client-side).
  activity: { date: string; runs: number }[];
  // Real shape confirmed live, matches the sprint doc's guess exactly.
  attention: { failedRuns: number; workspacesWithPendingSuggestions: number };
  // Real shape confirmed live, matches the sprint doc's guess exactly. Real `kind` values observed:
  // "failed_run", "pending_suggestions", "incomplete_profile" — "low_credits"/"stale_document"
  // (from the doc's own defensive icon map) not yet observed live but plausible, kept as a
  // generic-icon fallback rather than assumed absent.
  actionItems: ActionItem[];
}

export interface ActionItem {
  kind: string;
  label: string;
  href: string;
  priority: "high" | "medium" | "low";
}

export const dashboardApi = {
  get: () => api.get<DashboardData>("/dashboard"),
};
