"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { CreditLedgerEntry } from "./credits.types";

// Real shape confirmed live: { balance: number }.
// `pollUntilAbove`: used only right after a credit-pack Stripe Checkout redirect back
// (?purchase=success), same "the redirect itself grants nothing, the webhook does" rule as
// useSubscription's pollUntilActive (features/payments/hooks/use-payments.ts) — poll every 2s
// until the balance genuinely exceeds what it was before checkout, rather than trusting the URL.
export function useCredits(pollUntilAbove?: number) {
  return useQuery({
    queryKey: ["credits"],
    queryFn: () => api.get<{ balance: number }>("/credits"),
    refetchInterval: pollUntilAbove !== undefined ? (query) => ((query.state.data?.balance ?? 0) > pollUntilAbove ? false : 2000) : false,
  });
}

// Cursor-paginated (confirmed live: meta.nextCursor is an opaque base64 token, meta.hasMore is a
// real boolean — the same api.list() helper other list endpoints will eventually use).
export function useCreditHistory() {
  return useInfiniteQuery({
    queryKey: ["credits", "history"],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => api.list<CreditLedgerEntry[]>("/credits/history", pageParam ? { cursor: pageParam, limit: 20 } : { limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
  });
}
