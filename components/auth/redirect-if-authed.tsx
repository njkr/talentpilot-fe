"use client";

import { useEffect, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Guards the (auth) route group the other direction from RequireAuth: an already-authenticated,
 * verified user has no reason to see login/register/forgot/reset — bounce them to /dashboard.
 *
 * Only fires on 'authed' + isVerified. An authed-but-unverified user (or a plain anonymous
 * visitor) still needs these pages — verify-email in particular is reached mid-flow, right after
 * register, before a session even exists. Same rule as RequireAuth: never redirect on 'loading',
 * AuthBootstrap already holds the whole app on a splash until status resolves.
 */
export function RedirectIfAuthed({ children }: PropsWithChildren) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (status === "authed" && user?.isVerified) router.replace("/dashboard");
  }, [status, user, router]);

  if (status === "authed" && user?.isVerified) return null;

  return <>{children}</>;
}
