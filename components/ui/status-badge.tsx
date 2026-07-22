import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  created: { label: "Draft", className: "bg-ink-muted/10 text-ink-secondary" },
  queued: { label: "Queued", className: "bg-warning/10 text-warning" },
  processing: { label: "Running", className: "bg-primary/10 text-primary" },
  completed: { label: "Complete", className: "bg-success/10 text-success" },
  partial: { label: "Partial", className: "bg-warning/10 text-warning" },
  failed: { label: "Failed", className: "bg-danger/10 text-danger" },
};

// Reused across the app for every workspace/run status — the soft `/10` tint + saturated text is
// the calm, non-neon status treatment the design doc asks for.
export function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] ?? statusConfig.created;
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}
