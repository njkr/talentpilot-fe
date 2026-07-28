"use client";

import { useEffect, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { FullPageSpinner } from "@/components/ui/full-page-spinner";

/**
 * Guards the (app) route group. Reacts to 'anon' and 'authed', and shows a splash on 'loading' —
 * this is the ONLY place that gate lives now (AuthBootstrap used to block the whole app on it;
 * moved here so public routes outside (app)/(auth) render immediately instead of behind a global
 * spinner). If this redirected on 'loading' too, every reload would flash /login before the
 * refresh completes — so 'loading' shows the splash, never redirects.
 */
export function RequireAuth({ children }: PropsWithChildren) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (status === "anon") {
      router.replace("/login");
      return;
    }
    // A logged-in but unverified user is bounced to verify for anything in the app.
    if (status === "authed" && user && !user.isVerified) router.replace("/verify-email");
  }, [status, user, router]);

  if (status === "loading") return <FullPageSpinner />;
  if (status !== "authed") return null;
  if (user && !user.isVerified) return null;

  return <>{children}</>;
}
