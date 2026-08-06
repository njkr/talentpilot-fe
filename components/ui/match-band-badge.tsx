import { cn } from "@/lib/utils";

export type MatchBandTier = "low" | "fair" | "strong";

const MATCH_BAND_CONFIG: Record<MatchBandTier, { label: string; className: string }> = {
  low: { label: "Low match", className: "bg-danger/10 text-danger" },
  fair: { label: "Fair match", className: "bg-warning/10 text-warning" },
  strong: { label: "Strong match", className: "bg-success/10 text-success" },
};

export function MatchBandBadge({ band }: { band: MatchBandTier }) {
  const c = MATCH_BAND_CONFIG[band];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}
