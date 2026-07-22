"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/features/auth/auth.hooks";
import { ApiError } from "@/lib/api/error";
import { toast } from "@/components/ui/toast";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type Form = z.infer<typeof loginSchema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();
  const router = useRouter();
  const wasReset = useSearchParams().get("reset") === "1";

  const onSubmit = (values: Form) =>
    login.mutate(values, {
      onError: (err) => {
        if (!(err instanceof ApiError)) return;

        // An unverified user CAN authenticate but is routed to the verify screen instead of the app.
        if (err.code === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }
        if (err.code === "RATE_LIMITED") {
          const retryAfterSec = err.details?.retryAfterSec as number | undefined;
          toast(`Slow down — retry in ${retryAfterSec ?? 30}s`, "warning");
          return;
        }
        // Suspension is a real, distinct state (not an enumeration leak — it only fires for
        // otherwise-correct credentials), so it gets its own message rather than the generic one.
        if (err.code === "ACCOUNT_SUSPENDED") {
          setError("root", { message: "This account has been suspended." });
          return;
        }

        // CRITICAL: the backend returns an IDENTICAL error for unknown-email and wrong-password
        // (deliberate anti-enumeration). Show ONE generic message for everything else. Never write
        // copy that distinguishes them — you'd be leaking what the backend went out of its way to hide.
        setError("root", { message: "Email or password is incorrect" });
      },
    });

  return (
    <AuthShell title="Welcome back">
      {wasReset && (
        <div className="mb-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          Password reset. Sign in with your new password.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Link href="/forgot-password" className="mt-1.5 block text-right text-xs text-primary">
            Forgot password?
          </Link>
        </div>
        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
        <Button type="submit" loading={login.isPending} className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-secondary text-center">
        No account?{" "}
        <Link href="/register" className="text-primary font-medium">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
