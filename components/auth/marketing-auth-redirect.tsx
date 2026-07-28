"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Bounces an already-authed, verified visitor from the marketing pages to /dashboard — but
 * unlike RedirectIfAuthed (which guards (auth)), this renders NOTHING itself and never blocks.
 * A marketing page must render immediately, every time, for SEO/crawlers/perf; showing a splash
 * (or returning null) while 'loading' would recreate the exact problem AuthBootstrap used to
 * cause site-wide. The tradeoff: a signed-in visitor who lands here sees a brief flash of the
 * marketing page before the client-side redirect fires. That's the normal, accepted behavior for
 * a public landing page and is not worth trading away instant SSR content for.
 *
 * Mount as a sibling of the page content in the (marketing) layout, not a wrapper around it.
 */
export function MarketingAuthRedirect() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (status === "authed" && user?.isVerified) router.replace("/dashboard");
  }, [status, user, router]);

  return null;
}
