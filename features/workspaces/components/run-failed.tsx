import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { H3, Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { STEP_META } from "../step-meta";
import type { RunState, StepName } from "../workspace.types";

interface RunFailedProps {
  run: RunState;
  onRetry: () => void;
  retrying: boolean;
}

export function RunFailed({ run, onRetry, retrying }: RunFailedProps) {
  const failedStep = run.steps.find((s) => s.status === "failed");
  const isPartial = run.status === "partial";
  const stepLabel = failedStep ? (STEP_META[failedStep.name as StepName]?.label ?? failedStep.name) : null;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className={cn("h-6 w-6 shrink-0", isPartial ? "text-warning" : "text-danger")} />
        <div className="flex-1">
          <H3>{isPartial ? "Analysis partially completed" : "Analysis couldn't finish"}</H3>
          <Body className="mt-1">{stepLabel ? `The "${stepLabel}" step didn't complete.` : "One step didn't complete."}</Body>
          {/* The live GET /runs/:id response carries a real, specific message per failed step
              (e.g. "The AI produced an invalid result...") — the SSE step.failed event itself
              doesn't include one, only the poll shape does. Show it when we have it. */}
          {failedStep?.error && <Caption className="mt-1 block">{failedStep.error}</Caption>}

          {/* Tell them about the refund UNPROMPTED — a charge for a failed run generates support
              tickets if the user discovers it before the refund. */}
          {run.creditsRefunded > 0 && <div className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">We refunded {run.creditsRefunded} credits for the steps that didn&apos;t complete.</div>}

          <div className="mt-4 flex gap-2">
            <Button onClick={onRetry} loading={retrying}>
              Retry at no extra cost
            </Button>
          </div>
          {/* Retry re-runs ONLY the failed step + its blocked dependents; the other completed
              steps are skipped and NOT re-charged. Say so — it removes credit anxiety. */}
          <Caption className="mt-2 block">Only the incomplete steps will re-run. You won&apos;t be charged again.</Caption>
        </div>
      </div>
    </Card>
  );
}
