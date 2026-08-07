import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.71"],
  // /api/v1/* proxying to the backend now lives in middleware.ts, not here — a plain
  // rewrites() entry can't inject the ngrok-skip-browser-warning header the backend's
  // tunnel currently needs on every request. See middleware.ts for the full rationale.
};

export default nextConfig;
