"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

// Real design tokens from app/globals.css — recharts props take raw color values, not Tailwind
// classes (the one place CLAUDE.md's "no raw hex" rule doesn't apply). Originally lived in
// cost-dashboard.tsx; moved here 2026-07-28 when this chart was extracted out to be shared with the
// new integrations per-provider daily view, so there's one copy instead of two.
const PRIMARY = "#2563eb";
const GRID = "#e5e7eb";
const AXIS_TEXT = "#6b7280";

export interface DailyMetricPoint {
  day: string;
  primary: number; // the one series actually plotted as the Area
  calls?: number; // shown as an extra Tooltip line only, never a second series/axis
  errors?: number; // same
}

interface DailyMetricsChartProps {
  points: DailyMetricPoint[];
  primaryLabel: string; // e.g. "Cost", "Calls" — used in the tooltip's primary-series line
  formatAxisTick: (v: number) => string; // e.g. v => `$${v}` or v => String(v)
  formatPrimary: (v: number) => string; // e.g. v => `$${v.toFixed(2)}` or v => String(v)
  emptyMessage?: string;
}

// Extracted out of cost-dashboard.tsx's original DailySpendChart (2026-07-28) so the integrations
// per-provider daily view could reuse the same recharts config instead of duplicating it — see
// CLAUDE.md's "Admin: third-party integration usage tracking" section for why. `calls`/`errors`
// are deliberately tooltip-only, never a second overlaid series/axis: dollars and raw counts don't
// share a scale, and this codebase has an established "restraint over decorative complexity" taste
// (e.g. the dashboard score-trend sparkline has no axes at all) that a dual-axis chart would break.
export function DailyMetricsChart({ points, primaryLabel, formatAxisTick, formatPrimary, emptyMessage }: DailyMetricsChartProps) {
  if (points.length === 0) {
    return <Caption>{emptyMessage ?? "No data in this window."}</Caption>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={points} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
        <XAxis dataKey="day" tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fontSize: 12, fill: AXIS_TEXT }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tickFormatter={formatAxisTick} tick={{ fontSize: 12, fill: AXIS_TEXT }} axisLine={false} tickLine={false} width={48} />
        <Tooltip content={<ChartTooltip primaryLabel={primaryLabel} formatPrimary={formatPrimary} />} />
        <Area type="monotone" dataKey="primary" stroke={PRIMARY} strokeWidth={2} fill={PRIMARY} fillOpacity={0.1} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// A custom tooltip content component (replacing the single-series version's plain
// formatter/labelFormatter/contentStyle combo) — needed because calls/errors have no chart series
// of their own to hang a `formatter` off; they're only reachable via `payload[0].payload`, the full
// source data row recharts attaches to every tooltip entry regardless of which fields have a
// visual series. recharts clones this element at render time and injects active/payload/label.
function ChartTooltip({
  active,
  payload,
  primaryLabel,
  formatPrimary,
}: {
  active?: boolean;
  payload?: { payload: DailyMetricPoint }[];
  primaryLabel: string;
  formatPrimary: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-ink">{new Date(point.day).toLocaleDateString()}</p>
      <p className="text-ink-secondary">
        {primaryLabel}: <span className="font-medium text-ink">{formatPrimary(point.primary)}</span>
      </p>
      {point.calls !== undefined && (
        <p className="text-ink-secondary">
          Calls: <span className="font-medium text-ink">{point.calls}</span>
        </p>
      )}
      {point.errors !== undefined && (
        <p className="text-ink-secondary">
          Errors: <span className={cn("font-medium", point.errors > 0 ? "text-danger" : "text-ink")}>{point.errors}</span>
        </p>
      )}
    </div>
  );
}
