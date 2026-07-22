import type { ApiError } from "@/lib/api/error";

/**
 * The single source of truth for "what does this error code DO in the UI".
 * Screens/mutations consult this. NEVER switch on error.message — that's human copy
 * and changes freely; error.code is a closed contract with the backend.
 *
 * Codes come straight from the API doc's error catalogue.
 */
export type ErrorAction =
  | { kind: "toast"; tone: "error" | "warning" }
  | { kind: "redirect"; to: string }
  | { kind: "modal"; modal: "upgrade" }
  | { kind: "inline" } // form handles it via `fields`
  | { kind: "silent" }; // handled elsewhere (e.g. token refresh)

export const errorActions: Record<string, ErrorAction> = {
  // auth — handled by the client interceptor, so 'silent' here
  TOKEN_EXPIRED: { kind: "silent" },
  TOKEN_INVALID: { kind: "silent" },
  TOKEN_REUSE_DETECTED: { kind: "silent" },
  TOKEN_SUPERSEDED: { kind: "silent" },
  EMAIL_NOT_VERIFIED: { kind: "redirect", to: "/verify-email" },

  // money / limits → the upgrade modal reads details (required/balance/limit/current)
  INSUFFICIENT_CREDITS: { kind: "modal", modal: "upgrade" },
  PLAN_LIMIT_REACHED: { kind: "modal", modal: "upgrade" },

  // forms
  VALIDATION_FAILED: { kind: "inline" },

  // pipeline
  ANALYSIS_ALREADY_RUNNING: { kind: "silent" }, // screen navigates to the existing run
  RATE_LIMITED: { kind: "toast", tone: "warning" },
};

export const actionFor = (e: ApiError): ErrorAction => errorActions[e.code] ?? { kind: "toast", tone: "error" };
