"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/features/auth/auth.hooks";
import { applyFieldErrors } from "@/features/auth/apply-field-errors";
import { registerSchema, type RegisterForm } from "@/features/auth/register-schema";
import { ApiError } from "@/lib/api/error";

function RegisterPageInner() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  const mutation = useRegister();
  // ?ref=CODE from an invite link (features/referrals) — passed straight through to registration,
  // never shown as a form field.
  const referralCode = useSearchParams().get("ref") ?? undefined;

  const onSubmit = (values: RegisterForm) =>
    mutation.mutate(
      { ...values, referralCode },
      {
        onError: (err) => {
          // Duplicate email -> 409 ALREADY_EXISTS (Problems.emailAlreadyRegistered) -> inline on the email field.
          if (err instanceof ApiError && err.code === "ALREADY_EXISTS") {
            setError("email", { message: "An account with this email already exists" });
            return;
          }
          if (!applyFieldErrors(err, setError)) {
            setError("root", { message: (err as ApiError).message });
          }
        },
      },
    );

  return (
    <AuthShell title="Create your account" subtitle="Start optimising your applications">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          helper="8+ characters, a letter and a number"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-secondary text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  // useSearchParams() opts the page out of static rendering — same Suspense-wrapping convention
  // as app/(app)/billing/page.tsx.
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
