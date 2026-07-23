import { cn } from "@/lib/utils";

const config: Record<"high" | "medium" | "low", { label: string; className: string }> = {
  high: { label: "High impact", className: "bg-success/10 text-success" },
  medium: { label: "Medium impact", className: "bg-primary/10 text-primary" },
  low: { label: "Low impact", className: "bg-ink-muted/10 text-ink-secondary" },
};

export function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const c = config[impact];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}
