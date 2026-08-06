"use client";

import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/error";
import type { ResendResult } from "@/components/auth/resend-button";
import { useResendOtp } from "../auth.hooks";

// Extracted so the standalone /verify-email page and the onboarding wizard's verify step share
// one implementation instead of two copies of the same error-handling logic — a bug fixed here
// (see the confirmed-live note below) would otherwise be easy to reintroduce in just one of them.
export function useResendHandler(email: string) {
  const resend = useResendOtp();

  const handleResend = async (): Promise<ResendResult> => {
    try {
      await resend.mutateAsync({ email });
      return { status: "sent" };
    } catch (err) {
      if (err instanceof ApiError) {
        // OTP_COOLDOWN (per-account) and RATE_LIMITED (3/min/IP, same code the login page already
        // handles) both carry details.retryAfterSec — treat them the same: sync the button's
        // countdown to the server's real remaining time instead of assuming the default 60s.
        if (err.code === "OTP_COOLDOWN" || err.code === "RATE_LIMITED") {
          return { status: "cooldown", retryAfterSec: (err.details?.retryAfterSec as number | undefined) ?? 60 };
        }
        toast(err.message, "error");
        return { status: "error" };
      }
      // Confirmed live: this used to be silently swallowed here — the button would start a fake
      // "success" countdown with no email ever sent and no explanation shown. Always surface
      // something now.
      toast("Couldn't resend the code — try again", "error");
      return { status: "error" };
    }
  };

  return { handleResend, pending: resend.isPending };
}
