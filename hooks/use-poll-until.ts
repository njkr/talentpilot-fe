import { useQuery } from "@tanstack/react-query";

/**
 * Polls a resource until a predicate says it's terminal, then stops.
 * Used by: resume parsing (until parsed|failed), document generation (until ready|failed|stale),
 * and — as an SSE fallback — run progress (until completed|failed|partial).
 *
 * `stale` on a document is deliberately treated as terminal-but-not-usable by the caller — the
 * doc says a stale doc must be re-requested, not served.
 */
export function usePollUntil<T>(key: unknown[], fetcher: () => Promise<T>, isTerminal: (data: T) => boolean, intervalMs = 2000, enabled = true) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    enabled,
    refetchInterval: (query) => {
      const data = query.state.data as T | undefined;
      return data && isTerminal(data) ? false : intervalMs; // stop polling once terminal
    },
  });
}
