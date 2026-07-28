import { Card } from "@/components/ui/card";
import { Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../dashboard.api";

// -1 means unlimited in the plan limits (per backend convention). Render it as infinity.
const limitLabel = (n: number) => (n === -1 ? "∞" : n);

export function StatRow({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Credits now carries the actionable "runs remaining" framing instead of a bare number. */}
      <Stat label="Credits" value={data.creditBalance} accent sub={`~${data.creditInsight.runsRemaining} more analyses`} />
      <Stat label="Resumes" value={`${data.resumes.count} / ${limitLabel(data.resumes.limit)}`} />
      <Stat label="Workspaces" value={data.workspaces.total} />
      {/* Completed now shows the average score alongside the count. */}
      <Stat label="Completed" value={data.workspaces.completed} sub={data.scoreInsight.averageScore != null ? `avg score ${data.scoreInsight.averageScore}` : undefined} />
    </div>
  );
}

function Stat({ label, value, accent, sub }: { label: string; value: React.ReactNode; accent?: boolean; sub?: string }) {
  return (
    <Card className="p-4">
      <Caption>{label}</Caption>
      <div className={cn("mt-1 text-2xl font-bold", accent ? "text-primary" : "text-ink")}>{value}</div>
      {sub && <Caption className="mt-0.5 block">{sub}</Caption>}
    </Card>
  );
}
