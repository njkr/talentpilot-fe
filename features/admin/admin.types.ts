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

// Real shape confirmed live. `resourceId` and `ip` are both real (CLAUDE.md's own Sprint 9-11 doc
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
