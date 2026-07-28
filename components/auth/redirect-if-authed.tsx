"use client";

import { useEffect, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { FullPageSpinner } from "@/components/ui/full-page-spinner";

/**
 * Guards the (auth) route group the other direction from RequireAuth: an already-authenticated,
 * verified user has no reason to see login/register/forgot/reset — bounce them to /dashboard.
 *
 * Only fires on 'authed' + isVerified. An authed-but-unverified user (or a plain anonymous
 * visitor) still needs these pages — verify-email in particular is reached mid-flow, right after
 * register, before a session even exists. Shows a splash on 'loading' (moved here from
 * AuthBootstrap, which used to block the whole app on it) so a reload on /login doesn't flash the
 * form for an instant before an already-authed user gets bounced to /dashboard.
 */
export function RedirectIfAuthed({ children }: PropsWithChildren) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (status === "authed" && user?.isVerified) router.replace("/dashboard");
  }, [status, user, router]);

  if (status === "loading") return <FullPageSpinner />;
  if (status === "authed" && user?.isVerified) return null;

  return <>{children}</>;
}
