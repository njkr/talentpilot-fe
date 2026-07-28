import { Card } from "@/components/ui/card";
import { H3, Caption } from "@/components/ui/typography";
import type { DashboardData } from "../dashboard.api";

export function ActivityCard({ activity }: { activity: DashboardData["activity"] }) {
  const max = Math.max(...activity.map((a) => a.runs), 1);
  const total = activity.reduce((n, a) => n + a.runs, 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <H3>Activity</H3>
        <Caption>
          {total} runs · {activity.length} days
        </Caption>
      </div>
      {/* A simple bar strip, not a heatmap grid — 14 days doesn't need one and the design calls
          for restraint over decorative complexity. The percentage height is set directly on the
          flex item (not a nested child): a flex item's own height resolves against its flex
          container's definite cross-size (h-16), but a percentage height one level deeper doesn't
          — that extra-wrapper version silently collapsed every bar to the same flat fallback
          regardless of run count, caught only by an actual screenshot, not lint/build. */}
      <div className="mt-4 flex h-16 items-end gap-1">
        {activity.map((a) => (
          <div
            key={a.date}
            title={`${a.date}: ${a.runs} runs`}
            className="w-full flex-1 rounded-sm bg-primary/70"
            style={{ height: a.runs ? `${Math.max((a.runs / max) * 100, 8)}%` : "2px", opacity: a.runs ? 1 : 0.3 }}
          />
        ))}
      </div>
    </Card>
  );
}
