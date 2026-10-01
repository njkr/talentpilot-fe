"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { H3 } from "@/components/ui/typography";
import { MetricCard } from "./metric-card";
import type { DashboardData } from "../dashboard.api";

// Same real design-token hex values already used in features/admin/components/daily-metrics-chart.tsx
// — recharts props take raw color values, not Tailwind classes, the one place DEVELOPMENT-NOTES.md's "no raw
// hex" rule doesn't apply (per that component's own note).
const PRIMARY = "#2563eb";

export function ScoreTrendCard({ insight }: { insight: DashboardData["scoreInsight"] }) {
  if (insight.latestScore == null) {
    return (
      <Card className="p-4">
        <H3>Score</H3>
        <EmptyState compact title="No scores yet" description="Run your first analysis to start tracking." />
      </Card>
    );
  }

  // Real `trend` is one point per run (not de-duped by day) and wasn't confirmed sorted live —
  // sort defensively so the sparkline reads left-to-right chronologically regardless.
  const points = [...insight.trend].sort((a, b) => a.date.localeCompare(b.date));
  const improving = insight.averageScore != null && insight.latestScore > insight.averageScore;

  return (
    <MetricCard
      icon={ChartBarIcon}
      label="Score"
      tone={improving ? "success" : "primary"}
      value={insight.latestScore}
      sub={insight.averageScore != null ? `avg ${insight.averageScore} · best ${insight.bestScore}` : undefined}
    >
      {points.length > 1 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Tooltip formatter={(v) => [`${v}`, "Score"]} labelFormatter={() => ""} contentStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="score" stroke={PRIMARY} strokeWidth={2} fill="url(#scoreTrendFill)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center text-xs text-ink-muted">Not enough runs yet for a trend</div>
      )}
    </MetricCard>
  );
}
