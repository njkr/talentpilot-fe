"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiError } from "@/lib/api/error";
import { useReport } from "../hooks/use-report";
import { ScoreCard } from "./score-card";
import { ScoreBreakdown } from "./score-breakdown";
import { KeywordTable } from "./keyword-table";
import { InsightsCard } from "./insights-card";

export function ReportTab({ workspaceId, active }: { workspaceId: string; active: boolean }) {
  const { data: report, isLoading, error } = useReport(workspaceId, active);

  if (isLoading) return <ReportSkeleton />;

  if (error instanceof ApiError && error.code === "REPORT_NOT_READY") {
    return <EmptyState title="No report yet" description="This workspace doesn't have a completed analysis run yet." />;
  }
  if (!report) return <EmptyState title="No report yet" description="Run an analysis to see your score." />;

  return (
    <div className="space-y-4">
      <ScoreCard report={report} />
      <ScoreBreakdown breakdown={report.scoreBreakdown} overallScore={report.overallScore} />
      <KeywordTable keywords={report.keywords} />
      <InsightsCard report={report} />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
