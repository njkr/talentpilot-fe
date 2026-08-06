"use client";

import { useEffect, useState } from "react";
import { usePollUntil } from "@/hooks/use-poll-until";
import { reportApi } from "../report.api";
import type { AtsReport } from "../report.types";

const STUCK_AFTER_MS = 45_000;

// Reuses the SAME query key as useReport (["workspaces", workspaceId, "report"]) — React Query
// shares that cache entry, so once a new report lands (different id), useReport's own observer
// picks it up automatically without a separate invalidate. `enabled` should only flip true once a
// rescore has actually been kicked off, with `previousReportId` snapshotting the report id from
// just before the mutation fired.
export function useRescorePoll(workspaceId: string, previousReportId: string | null, enabled: boolean) {
  const query = usePollUntil<AtsReport>(
    ["workspaces", workspaceId, "report"],
    () => reportApi.get(workspaceId),
    (r) => r.id !== previousReportId,
    2000,
    enabled,
  );

  // Tracks which previousReportId the stuck-timer last fired for, rather than a plain boolean
  // reset via setState in the effect body — that way `stuck` derives cleanly to false again once
  // a new rescore starts (new previousReportId), with no separate "reset" setState call needed.
  const [stuckFor, setStuckFor] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setStuckFor(previousReportId), STUCK_AFTER_MS);
    return () => clearTimeout(timer);
  }, [enabled, previousReportId]);

  const done = enabled && !!query.data && query.data.id !== previousReportId;
  const stuck = enabled && stuckFor === previousReportId;

  return { ...query, done, stuck };
}
