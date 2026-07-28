"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChipGroup } from "@/components/ui/chip-group";
import { H1, H3, Caption } from "@/components/ui/typography";
import { useAdminCosts } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import { DailyMetricsChart } from "./daily-metrics-chart";

export function CostDashboard() {
  const [days, setDays] = useState<"7" | "30">("7");
  const { data, isLoading, error } = useAdminCosts(Number(days));

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <H1>AI costs</H1>
          <ChipGroup value={days} onChange={setDays} options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }]} />
        </div>

        {isLoading || !data ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <>
            <Card>
              <H3 className="mb-4">Daily spend</H3>
              {/* calls/errors added to byDay 2026-07-28 — now surfaced as extra Tooltip lines on
                  hover rather than a second series/axis (see daily-metrics-chart.tsx). */}
              <DailyMetricsChart
                points={data.byDay.map((d) => ({ day: d.day, primary: Number(d.costUsd), calls: Number(d.calls), errors: Number(d.errors) }))}
                primaryLabel="Cost"
                formatAxisTick={(v) => `$${v}`}
                formatPrimary={(v) => `$${v.toFixed(2)}`}
                emptyMessage="No AI spend in this window."
              />
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <H3 className="mb-3">Top users by cost</H3>
                {data.topUsers.length === 0 ? (
                  <Caption>No AI spend in this window.</Caption>
                ) : (
                  <div className="divide-y divide-border">
                    {data.topUsers.map((u) => (
                      <div key={u.userId} className="flex items-center justify-between py-2.5">
                        <span className="font-mono text-xs text-ink-secondary">{u.userId.slice(0, 12)}</span>
                        <span className="font-mono text-sm text-ink">${Number(u.costUsd).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <H3 className="mb-3">Cost by feature</H3>
                {data.byFeature.length === 0 ? <Caption>No AI spend in this window.</Caption> : <FeatureBars byFeature={data.byFeature} />}
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminQueryBoundary>
  );
}

// A single-hue magnitude comparison (not identity) — one consistent color, bar length carries the
// value. Replaces the sprint doc's "failure rate by feature" panel, which has no corresponding
// data anywhere in the real /admin/costs response (confirmed via Postman's saved example — no
// failureRate/model/failure_rate field exists); this shows the real byFeature data instead.
function FeatureBars({ byFeature }: { byFeature: { feature: string; costUsd: string; calls: string }[] }) {
  const rows = byFeature.map((f) => ({ ...f, cost: Number(f.costUsd) })).sort((a, b) => b.cost - a.cost);
  const max = Math.max(...rows.map((r) => r.cost), 0.0001);

  return (
    <div className="space-y-3">
      {rows.map((f) => (
        <div key={f.feature}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-sm text-ink">{f.feature}</span>
            <span className="shrink-0 font-mono text-xs text-ink-secondary">
              ${f.cost.toFixed(2)} · {f.calls} calls
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(f.cost / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
