"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";
import { ResendButton } from "@/components/auth/resend-button";
import { Spinner } from "@/components/ui/spinner";
import { useVerifyEmail, useResendOtp } from "@/features/auth/auth.hooks";
import { ApiError } from "@/lib/api/error";

function VerifyEmailForm() {
  const email = useSearchParams().get("email") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const verify = useVerifyEmail();
  const resend = useResendOtp();

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

  const handleResend = async (): Promise<number | void> => {
    try {
      await resend.mutateAsync({ email });
    } catch (err) {
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN") {
        return err.details?.retryAfterSec as number | undefined;
      }
    }
  };

  return (
    <AuthShell title="Check your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <div className="space-y-4">
        <OtpInput value={code} onChange={setCode} onComplete={onComplete} disabled={verify.isPending} />
        {error && <p className="text-sm text-danger text-center">{error}</p>}
        {verify.isPending && <Spinner className="mx-auto h-5 w-5 text-primary" />}
        <ResendButton onResend={handleResend} pending={resend.isPending} />
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
