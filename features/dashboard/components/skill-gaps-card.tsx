import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { H3, Body, Caption } from "@/components/ui/typography";
import type { DashboardData } from "../dashboard.api";

export function SkillGapsCard({ gaps }: { gaps: DashboardData["topGaps"] }) {
  if (!gaps.length) {
    return (
      <Card>
        <H3>Recurring skill gaps</H3>
        <EmptyState compact title="No recurring gaps" description="Skills you're repeatedly missing will show here." />
      </Card>
    );
  }

  const max = gaps[0].missCount;
  return (
    <Card>
      <H3 className="mb-1">Recurring skill gaps</H3>
      <Body className="mb-3">Skills missing across multiple applications — worth closing.</Body>
      <div className="space-y-2">
        {gaps.map((g, i) => (
          <div key={g.keyword} className="flex items-center gap-2.5">
            <span className="w-4 shrink-0 text-right text-xs font-medium text-ink-muted">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate text-ink">{g.keyword}</span>
                <Caption>{g.missCount}</Caption>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
                <div className="h-full rounded-full bg-linear-to-r from-warning/50 to-warning/80" style={{ width: `${(g.missCount / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
