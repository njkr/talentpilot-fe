import Link from "next/link";
import { BoltIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./metric-card";
import type { DashboardData } from "../dashboard.api";

export function CreditInsightCard({ insight }: { insight: DashboardData["creditInsight"] }) {
  const low = insight.runsRemaining < 2;
  const maxFlow = Math.max(insight.spentLast30Days, insight.grantedLast30Days, 1);

  return (
    <MetricCard
      icon={BoltIcon}
      label="Credits"
      tone={low ? "warning" : "primary"}
      value={insight.balance}
      sub={`≈ ${insight.runsRemaining} analyses left`}
      footer={
        // A nudge, not a permanent upsell — only appears when they're actually running low.
        low ? (
          <Button asChild size="sm" variant="secondary" icon={BoltIcon} className="w-full">
            <Link href="/billing">Top up credits</Link>
          </Button>
        ) : undefined
      }
    >
      {/* Spent vs received (30d) as a compact two-segment comparison — real aggregates, no chart
          library needed for two bars. */}
      <div className="flex h-full flex-col justify-center gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] text-ink-muted">Spent</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full bg-danger/60" style={{ width: `${(insight.spentLast30Days / maxFlow) * 100}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-[10px] text-ink-secondary">{insight.spentLast30Days}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] text-ink-muted">Gained</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full bg-success/60" style={{ width: `${(insight.grantedLast30Days / maxFlow) * 100}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-[10px] text-ink-secondary">{insight.grantedLast30Days}</span>
        </div>
      </div>
    </MetricCard>
  );
}
