import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { MetricCard } from "./metric-card";
import type { DashboardData } from "../dashboard.api";

export function ActivityCard({ activity }: { activity: DashboardData["activity"] }) {
  const max = Math.max(...activity.map((a) => a.runs), 1);
  const total = activity.reduce((n, a) => n + a.runs, 0);

  return (
    <MetricCard icon={CalendarDaysIcon} label="Activity" value={total} sub={`${activity.length}-day window`}>
      {/* A simple bar strip, not a heatmap grid — restraint over decorative complexity. The
          percentage height is set directly on the flex item (not a nested child): a flex item's
          own height resolves against its flex container's definite cross-size, but a percentage
          height one level deeper doesn't — that extra-wrapper version silently collapsed every bar
          to the same flat fallback regardless of run count, caught only by an actual screenshot,
          not lint/build. */}
      <div className="flex h-full items-end gap-0.5">
        {activity.map((a) => (
          <div
            key={a.date}
            title={`${a.date}: ${a.runs} runs`}
            className="w-full flex-1 rounded-t-sm bg-linear-to-t from-primary/80 to-primary/40"
            style={{ height: a.runs ? `${Math.max((a.runs / max) * 100, 10)}%` : "2px", opacity: a.runs ? 1 : 0.25 }}
          />
        ))}
      </div>
    </MetricCard>
  );
}
