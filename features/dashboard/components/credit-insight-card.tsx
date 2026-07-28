import Link from "next/link";
import { BoltIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import type { DashboardData } from "../dashboard.api";

export function CreditInsightCard({ insight }: { insight: DashboardData["creditInsight"] }) {
  return (
    <Card>
      <H3>Credits</H3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">{insight.balance}</span>
        <span className="text-sm text-ink-secondary">≈ {insight.runsRemaining} analyses left</span>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-secondary">Spent (30 days)</span>
          <span className="font-medium text-ink">{insight.spentLast30Days}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-secondary">Received (30 days)</span>
          <span className="font-medium text-success">+{insight.grantedLast30Days}</span>
        </div>
        {insight.monthlyAllowance > 0 && (
          <div className="flex justify-between">
            <span className="text-ink-secondary">Monthly allowance</span>
            <span className="font-medium text-ink">{insight.monthlyAllowance}</span>
          </div>
        )}
      </div>

      {/* A nudge, not a permanent upsell — only appears when they're actually running low. */}
      {insight.runsRemaining < 2 && (
        <Button asChild size="sm" variant="secondary" icon={BoltIcon} className="mt-4 w-full">
          <Link href="/billing">Top up credits</Link>
        </Button>
      )}
    </Card>
  );
}
