"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChipGroup } from "@/components/ui/chip-group";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { H1, H3, Caption } from "@/components/ui/typography";
import { useIntegrationsOverview, useIntegrationDaily } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import { DailyMetricsChart } from "./daily-metrics-chart";
import { INTEGRATION_PROVIDERS, type IntegrationProvider, type AdminIntegrationDaily } from "../admin.types";

export function IntegrationsDashboard() {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useIntegrationsOverview();
  const [provider, setProvider] = useState<IntegrationProvider>(INTEGRATION_PROVIDERS[0]);
  const [days, setDays] = useState<"7" | "30">("30");
  const { data: daily, isLoading: dailyLoading, error: dailyError } = useIntegrationDaily(provider, Number(days));

  return (
    <AdminQueryBoundary error={overviewError}>
      <div className="space-y-6">
        <H1>Integrations</H1>

        <Card>
          <H3 className="mb-3">Last 24 hours</H3>
          {overviewLoading || !overview ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <div className="divide-y divide-border">
              {overview.providers.map((p) => (
                <div key={p.provider} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize text-ink">{p.provider}</span>
                    {p.errors > 0 && (
                      <Badge tone="danger">
                        {p.errors} error{p.errors === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-ink-secondary">
                    <span>{p.calls} calls</span>
                    {/* Only openai ever carries costUsd — the key is genuinely absent on the other
                        four, so this column is omitted for them entirely rather than showing a
                        placeholder "$0.00"/blank cell. */}
                    {p.costUsd !== undefined && <span className="text-ink">${Number(p.costUsd).toFixed(2)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <H3>Daily history</H3>
            <div className="flex items-center gap-3">
              <Select value={provider} onValueChange={(v) => setProvider(v as IntegrationProvider)} options={INTEGRATION_PROVIDERS.map((p) => ({ value: p, label: p }))} />
              <ChipGroup value={days} onChange={setDays} options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }]} />
            </div>
          </div>
          {dailyLoading || !daily ? <Skeleton className="h-64 rounded-xl" /> : dailyError ? <Caption>Couldn&apos;t load history for this provider.</Caption> : <ProviderDailyChart daily={daily} />}
        </Card>
      </div>
    </AdminQueryBoundary>
  );
}

// Whether to plot cost or calls as the primary series is decided from the data itself (does ANY
// day in this window carry costUsd), not a hardcoded `provider === "openai"` check — stays correct
// without a code change if the backend ever starts tracking cost for another provider.
function ProviderDailyChart({ daily }: { daily: AdminIntegrationDaily }) {
  const hasCost = daily.days.some((d) => d.costUsd !== undefined);
  const points = daily.days.map((d) => ({
    day: d.day,
    primary: Number(hasCost ? d.costUsd : d.calls),
    calls: Number(d.calls),
    errors: Number(d.errors),
  }));

  return hasCost ? (
    <DailyMetricsChart points={points} primaryLabel="Cost" formatAxisTick={(v) => `$${v}`} formatPrimary={(v) => `$${v.toFixed(2)}`} emptyMessage="No activity in this window." />
  ) : (
    <DailyMetricsChart points={points} primaryLabel="Calls" formatAxisTick={(v) => String(v)} formatPrimary={(v) => String(v)} emptyMessage="No activity in this window." />
  );
}
