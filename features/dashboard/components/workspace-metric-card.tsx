import { RectangleStackIcon } from "@heroicons/react/24/outline";
import { MetricCard } from "./metric-card";
import type { DashboardData } from "../dashboard.api";

// -1 means unlimited in the plan limits (per backend convention). Render it as infinity.
const limitLabel = (n: number) => (n === -1 ? "∞" : n);

export function WorkspaceMetricCard({ workspaces, resumes }: { workspaces: DashboardData["workspaces"]; resumes: DashboardData["resumes"] }) {
  const { total, completed, processing, failed } = workspaces;
  const segments = [
    { count: completed, className: "bg-success" },
    { count: processing, className: "bg-primary" },
    { count: failed, className: "bg-danger" },
  ].filter((s) => s.count > 0);

  return (
    <MetricCard icon={RectangleStackIcon} label="Workspaces" value={total} sub={`${resumes.count} / ${limitLabel(resumes.limit)} resumes`}>
      <div className="flex h-full flex-col justify-center gap-2">
        {total > 0 ? (
          <div className="flex h-1.5 overflow-hidden rounded-full bg-bg" title={`${completed} completed · ${processing} in progress · ${failed} failed`}>
            {segments.map((s, i) => (
              <div key={i} className={s.className} style={{ width: `${(s.count / total) * 100}%` }} />
            ))}
          </div>
        ) : (
          <div className="h-1.5 rounded-full bg-bg" />
        )}
        <div className="flex items-center gap-3 text-[10px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> {completed}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {processing}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" /> {failed}
          </span>
        </div>
      </div>
    </MetricCard>
  );
}
