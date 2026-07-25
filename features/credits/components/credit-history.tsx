"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { H3, Caption } from "@/components/ui/typography";
import { timeAgo, cn } from "@/lib/utils";
import { useCreditHistory } from "../credits.hooks";
import { humanizeReason } from "../credits.types";

export function CreditHistory() {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useCreditHistory();
  const entries = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Card>
      <H3>Credit history</H3>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState compact className="mt-4" title="No credit activity yet" description="Spends and refills will show up here." />
      ) : (
        <div className="mt-4 divide-y divide-border">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm text-ink">{humanizeReason(entry.reason)}</p>
                <Caption>{timeAgo(entry.createdAt)}</Caption>
              </div>
              <span className={cn("text-sm font-medium tabular-nums", entry.amount >= 0 ? "text-success" : "text-ink-secondary")}>
                {entry.amount >= 0 ? "+" : ""}
                {entry.amount}
              </span>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <Button variant="secondary" size="sm" className="mt-4" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
          Load more
        </Button>
      )}
    </Card>
  );
}
