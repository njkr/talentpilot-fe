"use client";

import { H1, Body } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/features/dashboard/dashboard.hooks";
import { ActionItems } from "@/features/dashboard/components/action-items";
import { StatRow } from "@/features/dashboard/components/stat-row";
import { ScoreTrendCard } from "@/features/dashboard/components/score-trend-card";
import { CreditInsightCard } from "@/features/dashboard/components/credit-insight-card";
import { RecentWorkspaces } from "@/features/dashboard/components/recent-workspaces";
import { SkillGapsCard } from "@/features/dashboard/components/skill-gaps-card";
import { ActivityCard } from "@/features/dashboard/components/activity-card";
import { FirstRunEmptyState } from "@/features/dashboard/components/first-run-empty";

// Layout order is deliberate — priority top to bottom: what needs attention first (action items),
// then how you're doing (stat row, score trend, credits), then supporting detail (recent list,
// skill gaps, activity). Still ONE GET /dashboard call — every card reads from the same batched
// response, no fan-out.
export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return null;

  // Brand-new account -> guide them to the first action instead of showing empty zeros everywhere.
  const isEmpty = data.resumes.count === 0;

  return (
    <div className="space-y-6">
      <div>
        <H1>Dashboard</H1>
        <Body>Your application workspace at a glance.</Body>
      </div>

      {isEmpty ? (
        <FirstRunEmptyState />
      ) : (
        <>
          {data.actionItems.length > 0 && <ActionItems items={data.actionItems} />}

          <StatRow data={data} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ScoreTrendCard insight={data.scoreInsight} />
            <CreditInsightCard insight={data.creditInsight} />
          </div>

          <RecentWorkspaces items={data.workspaces.recent} />

          <div className="grid gap-4 lg:grid-cols-2">
            <SkillGapsCard gaps={data.topGaps} />
            <ActivityCard activity={data.activity} />
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-12 rounded-lg" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
