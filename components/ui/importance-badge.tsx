import { cn } from "@/lib/utils";
import type { Importance } from "@/features/jobs/job.types";

const config: Record<Importance, { label: string; className: string }> = {
  required: { label: "Required", className: "bg-danger/10 text-danger" },
  preferred: { label: "Preferred", className: "bg-primary/10 text-primary" },
  nice_to_have: { label: "Nice to have", className: "bg-ink-muted/10 text-ink-secondary" },
};

// Required=danger (must-have), preferred=primary, nice-to-have=muted. Reused in the Sprint 6
// keyword table so importance reads consistently across the app.
export function ImportanceBadge({ importance }: { importance: Importance }) {
  const c = config[importance];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}
