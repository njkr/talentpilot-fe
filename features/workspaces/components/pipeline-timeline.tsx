import { CheckCircleIcon, ExclamationCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { H3, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { STEP_ORDER, STEP_META } from "../step-meta";
import type { RunState, RunStep, StepStatus } from "../workspace.types";

export function PipelineTimeline({ run }: { run: RunState }) {
  return (
    <Card>
      {/* Weighted progress bar — driven by run.progress (NOT step count). optimize_resume alone
          is worth real points, so the bar is deliberately non-linear vs. steps completed. */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <H3>{run.status === "completed" ? "Analysis complete" : "Analyzing…"}</H3>
          <span className="text-sm font-medium text-ink-secondary">{run.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg">
          <div className="h-full bg-primary transition-[width] duration-400 ease-out" style={{ width: `${run.progress}%` }} />
        </div>
      </div>

      <div className="space-y-1">
        {/* Render the full canonical 12-step list, not just run.steps directly — the backend
            grows that array as steps actually start rather than pre-populating all 12 as
            pending, so relying on it alone would make rows appear/jump around mid-run. */}
        {STEP_ORDER.map((name) => {
          const step = run.steps.find((s) => s.name === name);
          return <StepRow key={name} name={name} step={step} />;
        })}
      </div>
    </Card>
  );
}

function StepRow({ name, step }: { name: string; step?: RunStep }) {
  const meta = STEP_META[name as keyof typeof STEP_META];
  const status = step?.status ?? "pending";
  const label = step?.label ?? meta?.label ?? name;

  return (
    <div className="flex items-center gap-3 py-2">
      <StepIcon status={status} />
      <span
        className={cn(
          "text-sm flex-1",
          status === "running" ? "font-medium text-ink" : status === "completed" ? "text-ink-secondary" : status === "failed" ? "text-danger" : "text-ink-muted",
        )}
      >
        {label}
      </span>
      {meta?.group === "parallel" && status === "running" && <Caption>running in parallel</Caption>}
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircleIcon className="h-5 w-5 text-success" />;
    case "running":
      return <Spinner className="h-5 w-5 text-primary" />;
    case "failed":
      return <ExclamationCircleIcon className="h-5 w-5 text-danger" />;
    case "skipped":
      return <MinusCircleIcon className="h-5 w-5 text-ink-muted" />;
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-border" />;
  }
}
