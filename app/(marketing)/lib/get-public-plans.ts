import type { Plan } from "@/features/payments/payment.types";

/**
 * Server-side-only fetch of the real, live plan catalog for the public pricing page — NOT the
 * client `api` wrapper (features/payments/payment.api.ts), which is wired to the browser-only
 * Zustand auth store and axios token-refresh interceptors that have no business running during a
 * Server Component render. Prices are real, admin-editable data that has already changed twice in
 * this project's history (see DEVELOPMENT-NOTES.md's "Billing: cancel / switch / packs" section) — this page
 * must never show fabricated or stale-on-purpose numbers.
 *
 * Returns [] on any failure (network down, backend not running) rather than throwing, so the
 * pricing page can degrade to "see live pricing after signup" instead of a hard 500.
 */
export async function getPublicPlans(): Promise<Plan[]> {
  try {
    // Server-side fetch() has no browser origin to resolve a relative URL against,
    // so this needs an absolute URL — NEXT_PUBLIC_API_URL is now a relative "/api/v1"
    // path (see next.config.ts's rewrite), which only resolves correctly in the
    // browser. BACKEND_API_ORIGIN (server-only, same var the rewrite uses) is the
    // real absolute backend URL; falling back to NEXT_PUBLIC_API_URL keeps local dev
    // working unchanged, since that's still absolute there (no proxy in dev).
    const base = process.env.BACKEND_API_ORIGIN
      ? `${process.env.BACKEND_API_ORIGIN}/api/v1`
      : process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${base}/plans`, {
      next: { revalidate: 300 },
      // The backend's current ngrok tunnel serves an HTML warning page to any request that
      // doesn't opt out of it — see middleware.ts for the full rationale. This is a direct
      // fetch (not proxied through middleware), so it needs the header set here too.
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: Plan[] };
    return body.data ?? [];
  } catch {
    return [];
  }
}
