"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@/lib/api/types";

/**
 * A returning user reloads the page: their access token lived in memory (gone on reload), but
 * the httpOnly refresh cookie is still in the browser. We must silently exchange the cookie for a
 * new session BEFORE rendering anything — otherwise the user sees a flash of the login screen on
 * every refresh, which makes the whole app feel broken.
 *
 * While the refresh is in flight, auth.status stays 'loading' and this renders a splash instead of
 * children. Only after it resolves do we know authed vs anon.
 */
export function AuthBootstrap({ children }: PropsWithChildren) {
  const status = useAuthStore((s) => s.status);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode mounts twice in dev — only bootstrap once
    ran.current = true;

    (async () => {
      try {
        // Direct call (not the auth hook) — this runs before any UI. The refresh reads the
        // httpOnly cookie the browser already carries; no token needed in memory.
        const data = await api.post<{ accessToken: string; user: User }>("/auth/refresh");
        setSession(data.accessToken, data.user);
      } catch {
        clear(); // no valid cookie → anonymous. Not an error, just "not logged in".
      }
    })();
  }, [setSession, clear]);

  // Block the whole app until we KNOW authed-or-anon. This is what prevents the login flash.
  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <Spinner className="h-6 w-6 text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}
