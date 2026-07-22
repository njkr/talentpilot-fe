"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/features/auth/auth.hooks";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  // The backend ALWAYS returns 204, even for an unknown email (never reveals existence). So on
  // success we ALWAYS show the same "check your email" screen — regardless of whether the
  // account exists. Do not branch on anything the backend didn't tell us.
  const onSubmit = (v: Form) => forgot.mutate(v, { onSuccess: () => setSent(true) });

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="If an account exists for that address, we've sent a reset link.">
        <Link href="/login" className="block text-center text-sm text-primary">
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send a link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Button type="submit" loading={forgot.isPending} className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
