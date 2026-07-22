import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // most data is fine for 30s; dashboards/lists don't need per-focus refetch
      retry: (count, err) => {
        // NEVER retry 4xx — a 402/403/404 won't fix itself, retrying just delays the error UI.
        // Retry network/5xx up to twice.
        if (err instanceof ApiError && err.status >= 400 && err.status < 500) return false;
        return count < 2;
      },
      refetchOnWindowFocus: false, // opt in per-query where it matters (dashboard), off by default
    },
    mutations: { retry: false }, // mutations are never auto-retried (could double-charge credits)
  },
});
