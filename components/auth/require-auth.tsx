"use client";

import { useEffect, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Guards the (app) route group. Reacts to 'anon' and 'authed' — and does NOTHING on 'loading'.
 * AuthBootstrap holds the whole app on a splash during 'loading', so this never sees a
 * still-resolving state hit the redirect. If this redirected on 'loading' too, every reload would
 * flash /login before the refresh completes. Bootstrap owns 'loading', this guard owns the
 * resolved states — that split is the entire pattern.
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

  if (status !== "authed") return null;
  if (user && !user.isVerified) return null;

  return <>{children}</>;
}
