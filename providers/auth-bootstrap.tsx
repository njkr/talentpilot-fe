"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth.store";
import type { User } from "@/lib/api/types";

/**
 * A returning user reloads the page: their access token lived in memory (gone on reload), but
 * the httpOnly refresh cookie is still in the browser. We must silently exchange the cookie for a
 * new session — otherwise the (app)/(auth) groups would flash their signed-out state on every
 * reload before this resolves.
 *
 * This component ONLY fires the refresh call now — it does NOT block rendering (see below for why
 * that changed). auth.status stays 'loading' until this resolves; RequireAuth and
 * RedirectIfAuthed are the ones that actually show a splash while 'loading', scoped to the
 * (app)/(auth) groups that care about auth state at all.
 */
export function AuthBootstrap({ children }: PropsWithChildren) {
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

  // Previously blocked ALL children (including public pages) on a full-page spinner while
  // 'loading' — that meant the server-rendered HTML for a public route like the marketing
  // landing page was a spinner, not the actual content, defeating SSR/SEO for any page outside
  // (app)/(auth). Public routes now render immediately; only the two guards below still gate.
  return <>{children}</>;
}
