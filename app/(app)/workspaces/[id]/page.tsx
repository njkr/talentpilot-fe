"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Body } from "@/components/ui/typography";
import { workspaceApi } from "@/features/workspaces/workspace.api";
import { useRunProgress } from "@/features/workspaces/hooks/use-run-progress";
import { useRetryRun } from "@/features/workspaces/hooks/use-retry-run";
import { WorkspaceHeader } from "@/features/workspaces/components/workspace-header";
import { WorkspaceView } from "@/features/workspaces/components/workspace-view";
import { AnalyzeButton } from "@/features/workspaces/components/analyze-button";
import { PipelineTimeline } from "@/features/workspaces/components/pipeline-timeline";
import { RunFailed } from "@/features/workspaces/components/run-failed";
import { RunComplete } from "@/features/workspaces/components/run-complete";

function WorkspacePageInner({ id }: { id: string }) {
  const runId = useSearchParams().get("run");
  const { data: workspace } = useQuery({
    queryKey: ["workspaces", id],
    queryFn: () => workspaceApi.get(id),
  });

  // If there's a run in progress (from the URL, or the workspace's own lastRunId), show the timeline.
  const activeRunId = runId ?? (workspace?.status === "processing" ? workspace.lastRunId : null);
  const run = useRunProgress(activeRunId);
  const retry = useRetryRun(id);

  if (!workspace) return <WorkspaceSkeleton />;

  // No ACTIVE run to track -> the pre-analysis state, UNLESS a run has been attempted before.
  // Gate on lastRunId existing, not on status === 'completed'/'partial': confirmed live that the
  // ATS report and suggestions are already real and viewable as soon as their own steps finish,
  // even when the run's overall status ends up 'failed' on a later, unrelated step (e.g. the
  // cover-letter fabrication guard). Excluding 'failed' here would hide genuinely available data
  // behind an "analyze again" prompt on every revisit that isn't via the live ?run= progress URL.
  if (!activeRunId || !run) {
    if (workspace.lastRunId) {
      return <WorkspaceView workspace={workspace} />;
    }
    return (
      <div className="space-y-6">
        <WorkspaceHeader workspace={workspace} />
        <Card className="text-center py-10">
          <H3>Ready to analyze</H3>
          <Body className="mt-1 mb-4">Run the full analysis to score and optimize this application.</Body>
          <AnalyzeButton workspaceId={id} resumeId={workspace.resumeId} jobDescriptionId={workspace.jobDescriptionId} />
        </Card>
      </div>
    );
  }

  // A run exists -> drive the screen off its state.
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />

      {run.status === "failed" || run.status === "partial" ? (
        <>
          <PipelineTimeline run={run} />
          <RunFailed run={run} retrying={retry.isPending} onRetry={() => retry.mutate(run.id)} />
        </>
      ) : run.status === "completed" ? (
        <RunComplete workspaceId={id} />
      ) : (
        <PipelineTimeline run={run} />
      )}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspacePageInner id={id} />
    </Suspense>
  );
}
