"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { cn, timeAgo } from "@/lib/utils";
import { useReport } from "@/features/report/hooks/use-report";
import { useRetryRun } from "../hooks/use-retry-run";
import { AnalyzeButton } from "./analyze-button";
import type { Workspace } from "../workspace.types";

// Same thresholds ScoreRing (report tab) uses, so a score reads the same tone everywhere.
function scoreTone(score: number) {
  return score >= 80 ? "bg-success/10 text-success" : score >= 60 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning";
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const href = workspace.lastRunId && workspace.status !== "created" ? `/workspaces/${workspace.id}?run=${workspace.lastRunId}` : `/workspaces/${workspace.id}`;

  // Any run ever attempted -> a report may already be readable, even if the run itself later
  // failed on an unrelated step (same "gate on lastRunId, not status" rule as the detail page).
  // A 409 REPORT_NOT_READY here just means no score pill renders — not an error.
  const { data: report } = useReport(workspace.id, !!workspace.lastRunId);
  const retry = useRetryRun(workspace.id);

  const needsAnalysis = !workspace.lastRunId;
  const canRetry = (workspace.status === "failed" || workspace.status === "partial") && !!workspace.lastRunId;

  return (
    <Card className="hover:border-ink-muted transition-colors">
      <Link href={href} className="block">
        <div className="flex items-start justify-between gap-2">
          {/* min-w-0 lets the flex item shrink below its content's intrinsic width so truncate
              actually clips instead of forcing the card (and grid track) wider than the viewport. */}
          <p className="min-w-0 truncate font-medium text-ink">{workspace.name}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {report && <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", scoreTone(report.overallScore))}>{report.overallScore}</span>}
            <StatusBadge status={workspace.status} />
          </div>
        </div>
        <Caption>{timeAgo(workspace.createdAt)}</Caption>
      </Link>

      {(needsAnalysis || canRetry) && (
        <div className="mt-3 flex justify-end border-t border-border pt-3">
          {needsAnalysis && <AnalyzeButton size="sm" workspaceId={workspace.id} resumeId={workspace.resumeId} jobDescriptionId={workspace.jobDescriptionId} />}
          {canRetry && (
            <Button size="sm" variant="secondary" icon={ArrowPathIcon} loading={retry.isPending} onClick={() => retry.mutate(workspace.lastRunId!)}>
              Retry at no extra cost
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
