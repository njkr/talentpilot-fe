"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";
import { ResendButton } from "@/components/auth/resend-button";
import { Spinner } from "@/components/ui/spinner";
import { useVerifyEmail } from "@/features/auth/auth.hooks";
import { useResendHandler } from "@/features/auth/hooks/use-resend-handler";
import { ApiError } from "@/lib/api/error";
import { useAuthStore } from "@/stores/auth.store";

function VerifyEmailForm() {
  // ⚠️ Confirmed live: RequireAuth's redirect here (an already-authed-but-unverified user — e.g.
  // logging into an existing unverified account, login itself returns 200 even when unverified)
  // carries NO ?email= query param — only the register/login-error flows pass one. Without this
  // fallback, `email` silently becomes "" and every resend/verify call 400s VALIDATION_FAILED
  // ("email must be an email") with no visible cause. The session's own user.email is already
  // populated by then (setSession runs before RequireAuth's redirect effect fires).
  const emailParam = useSearchParams().get("email");
  const sessionEmail = useAuthStore((s) => s.user?.email);
  const email = emailParam ?? sessionEmail ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const verify = useVerifyEmail();
  const { handleResend, pending: resendPending } = useResendHandler(email);

  const onComplete = (value: string) =>
    verify.mutate(
      { email, code: value },
      {
        onError: (err) => {
          if (err instanceof ApiError) {
            // The backend returns remaining attempts in details on OTP_INVALID. Surface it.
            if (err.code === "OTP_INVALID") {
              const remaining = err.details?.remaining as number | undefined;
              setError(remaining != null ? `Incorrect code — ${remaining} attempts left` : "Incorrect code");
            } else if (err.code === "OTP_EXPIRED") setError("That code expired. Request a new one.");
            else if (err.code === "OTP_MAX_ATTEMPTS") setError("Too many attempts. Request a new code.");
            else setError(err.message);
          }
        },
      },
    );

  return (
    <AuthShell title="Check your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <div className="space-y-4">
        <OtpInput value={code} onChange={setCode} onComplete={onComplete} disabled={verify.isPending} />
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        {verify.isPending && <Spinner className="mx-auto h-5 w-5 text-primary" />}
        <ResendButton onResend={handleResend} pending={resendPending} />
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
