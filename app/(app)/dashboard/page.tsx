"use client";

import Link from "next/link";
import { H1, H3, Body, Caption } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDashboard } from "@/features/dashboard/dashboard.hooks";
import type { DashboardData } from "@/features/dashboard/dashboard.api";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return null;

  // Brand-new account -> guide them to the first action instead of showing empty zeros.
  const isEmpty = data.resumes.count === 0;

  return (
    <div className="space-y-6">
      <div>
        <H1>Dashboard</H1>
        <Body>Your application workspace at a glance.</Body>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Credits" value={data.creditBalance} accent />
        <StatCard label="Resumes" value={`${data.resumes.count} / ${limitLabel(data.resumes.limit)}`} />
        <StatCard label="Workspaces" value={data.workspaces.total} />
        <StatCard label="Completed" value={data.workspaces.completed} />
      </div>

      {isEmpty ? (
        <Card>
          <EmptyState
            title="Upload your first resume"
            description="Add a resume and a job description to run your first analysis."
            action={{ label: "Upload a resume", href: "/resumes" }}
          />
        </Card>
      ) : (
        <RecentWorkspaces items={data.workspaces.recent} />
      )}
    </div>
  );
}

// -1 means unlimited in the plan limits (per backend convention). Render it as infinity.
const limitLabel = (n: number) => (n === -1 ? "∞" : n);

function StatCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <Card className="p-4">
      <Caption>{label}</Caption>
      <div className={cn("mt-1 text-2xl font-bold", accent ? "text-primary" : "text-ink")}>{value}</div>
    </Card>
  );
}

function RecentWorkspaces({ items }: { items: DashboardData["workspaces"]["recent"] }) {
  if (!items.length) return null;
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <H3>Recent workspaces</H3>
        <Link href="/workspaces" className="text-sm text-primary">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {items.map((ws) => (
          <Link key={ws.id} href={`/workspaces/${ws.id}`} className="flex items-center justify-between py-3 hover:bg-bg -mx-2 px-2 rounded-lg">
            <span className="text-sm font-medium text-ink truncate">{ws.name}</span>
            <StatusBadge status={ws.status} />
          </Link>
        ))}
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
