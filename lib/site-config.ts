// Single source of truth for the marketing site's canonical URL — metadata, JSON-LD, sitemap,
// robots, and the OG image all read from here rather than hardcoding a domain. See
// NEXT_PUBLIC_SITE_URL's own comment in .env.local: no production domain is registered yet, so
// this currently resolves to the local dev server. Update the env var, not this file, once a real
// domain exists.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
export const SITE_NAME = "TalentPilot";
