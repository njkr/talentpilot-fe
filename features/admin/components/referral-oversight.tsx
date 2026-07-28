"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { H1, H3, Caption } from "@/components/ui/typography";
import { timeAgo } from "@/lib/utils";
import { useAdminReferrals, useAdminReferralStats } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import { humanizeReferralStatus } from "../admin.types";
import type { AdminReferralRow } from "../admin.types";

export function ReferralOversight() {
  const { data: stats } = useAdminReferralStats();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminReferrals();

  const rows = data?.pages.flatMap((p) => p.data) ?? [];
  const conversion = stats && stats.totalInvited > 0 ? `${Math.round((stats.totalQualified / stats.totalInvited) * 100)}%` : "—";

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-6">
        <H1>Referrals</H1>

        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total invited" value={stats?.totalInvited ?? 0} />
          <StatCard label="Qualified" value={stats?.totalQualified ?? 0} />
          <StatCard label="Credits paid" value={stats?.totalCreditsPaid ?? 0} />
          {/* Conversion is the abuse signal — a healthy program converts ~20-40%; a sudden spike
              toward ~100% alongside a burst of similar-looking signups suggests farming. */}
          <StatCard label="Conversion" value={conversion} />
        </div>

        <Card>
          <H3 className="mb-3">Recent referrals</H3>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="No referrals yet" description="Invites will show up here once someone shares their link." compact />
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <ReferralRowView key={r.id} row={r} />
              ))}
            </div>
          )}
          {hasNextPage && (
            <Button variant="ghost" icon={ChevronDownIcon} className="mt-3 w-full" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
              Load more
            </Button>
          )}
        </Card>
      </div>
    </AdminQueryBoundary>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <Caption>{label}</Caption>
    </Card>
  );
}

function ReferralRowView({ row }: { row: AdminReferralRow }) {
  const tone = row.rewardGranted ? "success" : row.status === "signed_up" ? "neutral" : "primary";
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <div className="min-w-0 font-mono text-xs">
        <span className="text-primary">{row.referrerId.slice(0, 8)}</span>
        <span className="text-ink-muted"> → </span>
        <span className="truncate text-ink">{row.refereeEmail ?? row.refereeId?.slice(0, 8) ?? "pending"}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge tone={tone}>{humanizeReferralStatus(row.status)}</Badge>
        <Caption>{timeAgo(row.createdAt)}</Caption>
      </div>
    </div>
  );
}
