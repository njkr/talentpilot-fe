import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.71"],

  // Proxies /api/v1/* to the real backend so the browser only ever talks to THIS
  // app's own origin. Without this, the refresh cookie is a third-party cookie
  // (frontend and API on unrelated domains) — modern Chrome blocks those outright,
  // regardless of SameSite=None;Secure being set correctly. Confirmed live: the
  // cookie's Set-Cookie was exactly right, but the browser never stored/sent it
  // cross-site anyway. Routing through this rewrite makes it first-party instead.
  // BACKEND_API_ORIGIN is server-only (no NEXT_PUBLIC_ prefix — never shipped to
  // the browser): the backend's real base URL, no trailing slash and no /api/v1
  // suffix (e.g. https://xxxx.ngrok-free.app or the eventual Render URL).
  async rewrites() {
    const backend = process.env.BACKEND_API_ORIGIN;
    if (!backend) return [];
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

export default nextConfig;
