"use client";

import { H1, Body } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SlideUp } from "@/components/motion";
import { useDashboard } from "@/features/dashboard/dashboard.hooks";
import { ActionItems } from "@/features/dashboard/components/action-items";
import { ScoreTrendCard } from "@/features/dashboard/components/score-trend-card";
import { CreditInsightCard } from "@/features/dashboard/components/credit-insight-card";
import { ActivityCard } from "@/features/dashboard/components/activity-card";
import { WorkspaceMetricCard } from "@/features/dashboard/components/workspace-metric-card";
import { RecentWorkspaces } from "@/features/dashboard/components/recent-workspaces";
import { SkillGapsCard } from "@/features/dashboard/components/skill-gaps-card";
import { FirstRunEmptyState } from "@/features/dashboard/components/first-run-empty";

// Layout order is deliberate — priority top to bottom: what needs attention first (action items),
// then how you're doing (bento metrics row), then supporting detail (recent list, skill gaps).
// Still ONE GET /dashboard call — every card reads from the same batched response, no fan-out.
export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return null;

  // Brand-new account -> guide them to the first action instead of showing empty zeros everywhere.
  const isEmpty = data.resumes.count === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <H1>Dashboard</H1>
          <Body>Your application workspace at a glance.</Body>
        </div>
        <Badge tone="primary">{data.plan.name}</Badge>
      </div>

      {isEmpty ? (
        <FirstRunEmptyState />
      ) : (
        <>
          {data.actionItems.length > 0 && (
            <SlideUp>
              <ActionItems items={data.actionItems} />
            </SlideUp>
          )}

          <SlideUp delay={0.06}>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <CreditInsightCard insight={data.creditInsight} />
              <ScoreTrendCard insight={data.scoreInsight} />
              <ActivityCard activity={data.activity} />
              <WorkspaceMetricCard workspaces={data.workspaces} resumes={data.resumes} />
            </div>
          </SlideUp>

          <SlideUp delay={0.12}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <RecentWorkspaces items={data.workspaces.recent} />
              <SkillGapsCard gaps={data.topGaps} />
            </div>
          </SlideUp>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
