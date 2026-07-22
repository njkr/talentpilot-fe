"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/features/auth/auth.hooks";
import { ApiError } from "@/lib/api/error";

const schema = z.object({
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/\d/, "Include a number"),
});
type Form = z.infer<typeof schema>;

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This reset link is missing or malformed.">
        <Link href="/forgot-password" className="block text-center text-sm text-primary">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  const onSubmit = ({ password }: Form) =>
    reset.mutate(
      { token, password },
      {
        onError: (err) => {
          // RESET_TOKEN_INVALID -> link expired or used. Guide them to request a fresh one.
          if (err instanceof ApiError && err.code === "RESET_TOKEN_INVALID") {
            setError("password", { message: "This link is invalid or expired. Request a new one." });
          } else {
            setError("password", { message: (err as ApiError).message });
          }
        },
      },
    );

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          helper="8+ characters, a letter and a number"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={reset.isPending} className="w-full">
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
