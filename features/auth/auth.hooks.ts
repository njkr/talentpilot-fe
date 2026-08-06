"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "./auth.api";
import { useAuthStore } from "@/stores/auth.store";

// Register → does NOT log in (account unverified). Routes to verify screen.
export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (_user, vars) => router.push(`/verify-email?email=${encodeURIComponent(vars.email)}`),
  });
}

// Verify → the response carries a session (verification = first login). Store it, then a one-time
// "upload your resume" step before the dashboard — not straight to /dashboard.
export function useVerifyEmail() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (s) => {
      setSession(s.accessToken, s.user);
      router.push("/getting-started");
    },
  });
}

export function useResendOtp() {
  return useMutation({ mutationFn: authApi.resendOtp });
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (s) => {
      setSession(s.accessToken, s.user);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: authApi.logout,
    // Clear local state regardless of the network result — the cookie is revoked server-side
    // and we never want a "half logged in" UI. onSettled runs on both success and error.
    onSettled: () => {
      clear();
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.resetPassword,
    // Reset kills the old session server-side (tokenVersion bump). Force a fresh login.
    onSuccess: () => router.push("/login?reset=1"),
  });
}
