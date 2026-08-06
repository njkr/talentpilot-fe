"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";
import { ResendButton } from "@/components/auth/resend-button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/features/auth/auth.api";
import { registerSchema, type RegisterForm } from "@/features/auth/register-schema";
import { applyFieldErrors } from "@/features/auth/apply-field-errors";
import { useResendHandler } from "@/features/auth/hooks/use-resend-handler";
import { useUploadResume } from "@/features/resumes/hooks/use-upload-resume";
import { ACCEPTED_MIME_TYPES, MAX_BYTES } from "@/features/resumes/components/upload-dropzone";
import { useAuthStore } from "@/stores/auth.store";
import { ApiError } from "@/lib/api/error";
import { cn } from "@/lib/utils";

type Step = "upload" | "confirm" | "register" | "verify" | "finishing";

// Only the 3 real steps get a dot — "confirm" and "finishing" are brief transitional states, not
// something worth asking the user to track progress against.
const DOT_STEPS: Step[] = ["upload", "register", "verify"];

function StepDots({ step }: { step: Step }) {
  const activeIndex = step === "confirm" ? 0 : step === "finishing" ? 2 : DOT_STEPS.indexOf(step);
  return (
    <div className="mb-6 flex justify-center gap-1.5">
      {DOT_STEPS.map((_, i) => (
        <span key={i} className={cn("h-1.5 w-6 rounded-full transition-colors", i <= activeIndex ? "bg-primary" : "bg-border")} />
      ))}
    </div>
  );
}

// Lives OUTSIDE (auth) deliberately — that group's layout wraps every page in RedirectIfAuthed,
// which force-navigates to /dashboard the instant status becomes authed+verified. This wizard's
// own verify step calls setSession() itself (needed so the immediately-following upload request
// carries a real Bearer token), and if RedirectIfAuthed were also watching, it would race the
// wizard's own post-upload navigation — e.g. silently discarding an intended "send them to
// /getting-started to retry" outcome on a failed upload in favor of a hardcoded bounce straight to
// /dashboard. The one useful part of that guard (bounce an already-signed-in-and-verified visitor
// away) is replicated manually below instead, fully under this page's own control.
export default function OnboardingPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    if (status === "authed" && user?.isVerified) router.replace("/dashboard");
  }, [status, user, router]);

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  // Direct API calls, not useRegister()/useVerifyEmail() — those hooks hardcode navigation to the
  // standalone /verify-email and /dashboard routes, which this wizard deliberately overrides with
  // its own step transitions and (for verify) a real upload attempt before leaving the page.
  const registerMutation = useMutation({ mutationFn: authApi.register });
  const verifyMutation = useMutation({ mutationFn: authApi.verifyEmail });
  const { handleResend, pending: resendPending } = useResendHandler(email);
  const upload = useUploadResume();

  const handleFilePicked = (picked: File) => {
    setFileError(null);
    setFile(picked);
    setStep("confirm");
    setTimeout(() => setStep("register"), 900);
  };

  const onRegisterSubmit = (values: RegisterForm) =>
    registerMutation.mutate(values, {
      onSuccess: () => {
        setEmail(values.email);
        setStep("verify");
      },
      onError: (err) => {
        // Same handling as the standalone register page — 409 ALREADY_EXISTS -> inline email
        // error, VALIDATION_FAILED -> per-field errors, everything else -> a root form error.
        if (err instanceof ApiError && err.code === "ALREADY_EXISTS") {
          registerForm.setError("email", { message: "An account with this email already exists" });
          return;
        }
        if (!applyFieldErrors(err, registerForm.setError)) {
          registerForm.setError("root", { message: (err as ApiError).message });
        }
      },
    });

  const onOtpComplete = (value: string) =>
    verifyMutation.mutate(
      { email, code: value },
      {
        onSuccess: (session) => {
          setSession(session.accessToken, session.user);
          setStep("finishing");
          if (file) {
            upload.mutate(file, {
              onSuccess: () => router.push("/dashboard"),
              // Real, complete upload-error handling (PLAN_LIMIT_REACHED, FILE_TOO_LARGE, etc.)
              // already lives on the fallback page — reused here instead of rebuilt a third time.
              onError: () => router.push("/getting-started"),
            });
          } else {
            router.push("/dashboard");
          }
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.code === "OTP_INVALID") {
              const remaining = err.details?.remaining as number | undefined;
              setOtpError(remaining != null ? `Incorrect code — ${remaining} attempts left` : "Incorrect code");
            } else if (err.code === "OTP_EXPIRED") setOtpError("That code expired. Request a new one.");
            else if (err.code === "OTP_MAX_ATTEMPTS") setOtpError("Too many attempts. Request a new code.");
            else setOtpError(err.message);
          }
        },
      },
    );

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <StepDots step={step} />

        {step === "upload" && (
          <AuthShell title="Let's see your resume" subtitle="We'll use it to score and tailor your applications once you're signed in.">
            <FileDropzone
              accept=".pdf,.docx"
              acceptedMimeTypes={ACCEPTED_MIME_TYPES}
              maxBytes={MAX_BYTES}
              pending={false}
              error={fileError}
              label="Drop your resume here, or click to browse"
              helper="PDF or DOCX, up to 10MB"
              onFile={handleFilePicked}
              onValidationError={setFileError}
            />
            <button onClick={() => setStep("register")} className="mt-4 w-full text-center text-sm text-ink-secondary hover:text-ink">
              Skip for now
            </button>
          </AuthShell>
        )}

        {step === "confirm" && file && (
          <AuthShell title="Got it!" subtitle="Let's create your account.">
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircleIcon className="h-10 w-10 text-success" />
              <p className="text-sm font-medium text-ink">{file.name}</p>
            </div>
          </AuthShell>
        )}

        {step === "register" && (
          <AuthShell title="Create your account" subtitle={file ? `We'll add ${file.name} once you're verified.` : "Start optimising your applications"}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <Input label="Email" type="email" autoComplete="email" error={registerForm.formState.errors.email?.message} {...registerForm.register("email")} />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                helper="8+ characters, a letter and a number"
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register("password")}
              />
              {registerForm.formState.errors.root && <p className="text-sm text-danger">{registerForm.formState.errors.root.message}</p>}
              <Button type="submit" loading={registerMutation.isPending} className="w-full">
                Create account
              </Button>
            </form>
          </AuthShell>
        )}

        {step === "verify" && (
          <AuthShell title="Check your email" subtitle={`We sent a 6-digit code to ${email}`}>
            <div className="space-y-4">
              <OtpInput value={code} onChange={setCode} onComplete={onOtpComplete} disabled={verifyMutation.isPending} />
              {otpError && <p className="text-sm text-danger text-center">{otpError}</p>}
              {verifyMutation.isPending && <Spinner className="mx-auto h-5 w-5 text-primary" />}
              <ResendButton onResend={handleResend} pending={resendPending} />
            </div>
          </AuthShell>
        )}

        {step === "finishing" && (
          <AuthShell title="Almost there" subtitle={file ? "Uploading your resume…" : "Setting up your account…"}>
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6 text-primary" />
            </div>
          </AuthShell>
        )}
      </div>
    </div>
  );
}
