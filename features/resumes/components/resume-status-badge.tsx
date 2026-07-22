import { cn } from "@/lib/utils";
import type { ResumeStatus } from "../resume.types";

const config: Record<ResumeStatus, { label: string; className: string }> = {
  uploaded: { label: "Uploaded", className: "bg-ink-muted/10 text-ink-secondary" },
  extracting: { label: "Reading", className: "bg-primary/10 text-primary" },
  extracted: { label: "Extracted", className: "bg-ink-muted/10 text-ink-secondary" },
  parsing: { label: "Parsing", className: "bg-primary/10 text-primary" },
  parsed: { label: "Parsed", className: "bg-success/10 text-success" },
  failed: { label: "Failed", className: "bg-danger/10 text-danger" },
};

export function ResumeStatusBadge({ status }: { status: ResumeStatus }) {
  const c = config[status];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}
