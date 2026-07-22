import { cn } from "@/lib/utils";
import type { JobStatus } from "../job.types";

// The shared workspace StatusBadge's keys (created/queued/processing/...) don't cover JobStatus
// ('analyzing'/'analyzed'/'failed') — a dedicated badge avoids silently falling back to a wrong
// label for a status it doesn't recognize.
const config: Record<JobStatus, { label: string; className: string }> = {
  analyzing: { label: "Analyzing", className: "bg-primary/10 text-primary" },
  analyzed: { label: "Analyzed", className: "bg-success/10 text-success" },
  failed: { label: "Failed", className: "bg-danger/10 text-danger" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const c = config[status];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}
