"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { CreditLedgerEntry } from "./credits.types";

// Real shape confirmed live: { balance: number }.
export function useCredits() {
  return useQuery({ queryKey: ["credits"], queryFn: () => api.get<{ balance: number }>("/credits") });
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
