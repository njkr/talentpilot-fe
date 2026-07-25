"use client";

import { LightBulbIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { H3, Body, Caption } from "@/components/ui/typography";
import { useSalaryEstimate } from "../hooks/use-salary-estimate";
import { SalaryRange } from "./salary-range";

export function SalaryTab({ workspaceId, active }: { workspaceId: string; active: boolean }) {
  const { data, isLoading, error } = useSalaryEstimate(workspaceId, active);

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  // estimate_salary is also an OPTIONAL step — absence is a partial run, not a bug.
  if (error || !data) return <EmptyState title="Salary estimate unavailable" description="This step didn't complete during the analysis. Retry the run to try again." />;

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <H3>Estimated range</H3>
            <Caption>Based on market data for this role and location</Caption>
          </div>
          {/* The estimate label is non-negotiable — it's baked into the row itself (isEstimate is
              always true). */}
          <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Estimate</span>
        </div>

        <SalaryRange p25={data.p25} p50={data.p50} p75={data.p75} currency={data.currency} />
      </Card>

      <Card>
        <H3 className="mb-2">How this was estimated</H3>
        <Body>{data.methodology}</Body>
        {data.factors.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {data.factors.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-secondary">
                <span className="text-ink-muted">•</span>
                {f}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {data.negotiationTips.length > 0 && (
        <Card>
          <H3 className="mb-3">Negotiation notes</H3>
          <ul className="space-y-2.5">
            {data.negotiationTips.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-secondary">
                <LightBulbIcon className="h-4 w-4 shrink-0 text-warning mt-0.5" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
