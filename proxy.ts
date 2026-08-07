import { NextResponse, type NextRequest } from "next/server";

// Proxies /api/v1/* to the real backend so the browser only ever talks to THIS app's own origin
// (first-party refresh cookie — see next.config.ts's history for why a plain `rewrites()` entry
// isn't enough on its own: it can't inject a header into the proxied request). This file used to
// be middleware.ts — Next.js 16 renamed the convention to proxy.ts (file AND exported function),
// per the official middleware-to-proxy codemod/migration guide.
//
// BACKEND_API_ORIGIN is server-only (no NEXT_PUBLIC_ prefix — never shipped to the browser): the
// backend's real base URL, no trailing slash and no /api/v1 suffix (e.g. https://xxxx.ngrok-free.app
// or the eventual Render URL).
//
// The backend currently sits behind a free ngrok tunnel, which serves an HTML interstitial
// ("visit this site?" warning, ERR_NGROK_6024) to any request that doesn't explicitly opt out —
// including server-side proxied requests, not just a human clicking a link. ngrok-skip-browser-warning
// is ngrok's own documented bypass header; without it every proxied API call gets that warning
// page's HTML back instead of real JSON. Harmless to keep sending once the backend moves off ngrok.
export function proxy(request: NextRequest) {
  const backend = process.env.BACKEND_API_ORIGIN;
  if (!backend) return NextResponse.next();

  const url = new URL(request.url);
  const destination = new URL(`${backend}${url.pathname}${url.search}`);

  const headers = new Headers(request.headers);
  headers.set("ngrok-skip-browser-warning", "true");

  return NextResponse.rewrite(destination, { request: { headers } });
}

export const config = {
  matcher: "/api/v1/:path*",
};
