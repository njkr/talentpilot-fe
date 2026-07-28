import type { Plan } from "@/features/payments/payment.types";

/**
 * Server-side-only fetch of the real, live plan catalog for the public pricing page — NOT the
 * client `api` wrapper (features/payments/payment.api.ts), which is wired to the browser-only
 * Zustand auth store and axios token-refresh interceptors that have no business running during a
 * Server Component render. Prices are real, admin-editable data that has already changed twice in
 * this project's history (see CLAUDE.md's "Billing: cancel / switch / packs" section) — this page
 * must never show fabricated or stale-on-purpose numbers.
 *
 * Returns [] on any failure (network down, backend not running) rather than throwing, so the
 * pricing page can degrade to "see live pricing after signup" instead of a hard 500.
 */
export async function getPublicPlans(): Promise<Plan[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: Plan[] };
    return body.data ?? [];
  } catch {
    return [];
  }
}
