"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { H3 } from "@/components/ui/typography";
import type { DashboardData } from "../dashboard.api";

// Same real design-token hex values already used in features/admin/components/cost-dashboard.tsx
// — recharts props take raw color values, not Tailwind classes, the one place CLAUDE.md's "no raw
// hex" rule doesn't apply (per that component's own note).
const PRIMARY = "#2563eb";

export function ScoreTrendCard({ insight }: { insight: DashboardData["scoreInsight"] }) {
  if (insight.latestScore == null) {
    return (
      <Card>
        <H3>Score trend</H3>
        <EmptyState compact title="No scores yet" description="Run your first analysis to start tracking." />
      </Card>
    );
  }

  // A simple, honest signal — is the latest run above the running average?
  const improving = insight.averageScore != null && insight.latestScore > insight.averageScore;
  // Real `trend` is one point per run (not de-duped by day) and wasn't confirmed sorted live —
  // sort defensively so the sparkline reads left-to-right chronologically regardless.
  const points = [...insight.trend].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <H3>Score trend</H3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink">{insight.latestScore}</span>
            <span className="text-sm text-ink-secondary">latest</span>
            {improving && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> above average
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-ink-secondary">
            avg <span className="font-medium text-ink">{insight.averageScore}</span>
          </p>
          <p className="text-ink-secondary">
            best <span className="font-medium text-ink">{insight.bestScore}</span>
          </p>
        </div>
      </div>

      {/* Sparkline — minimal, no axes clutter, just the shape of the trend. */}
      {points.length > 1 && (
        <div className="mt-4 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <YAxis domain={[0, 100]} hide />
              <Tooltip formatter={(v) => [`${v}`, "Score"]} labelFormatter={() => ""} contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke={PRIMARY} strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
