"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterChip } from "@/components/ui/filter-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { H1, Caption } from "@/components/ui/typography";
import { timeAgo } from "@/lib/utils";
import { useAuditLog } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { AuditEntry } from "../admin.types";

const ACTOR_TYPES = ["admin", "user", "system"] as const;

export function AuditLog() {
  const [actorType, setActorType] = useState<string | undefined>(undefined);
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useAuditLog(actorType ? { actorType } : {});

  const entries = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H1>Audit log</H1>
          <div className="flex gap-1">
            <FilterChip active={!actorType} onClick={() => setActorType(undefined)}>
              All
            </FilterChip>
            {ACTOR_TYPES.map((t) => (
              <FilterChip key={t} active={actorType === t} onClick={() => setActorType(t)}>
                {t}
              </FilterChip>
            ))}
          </div>
        </div>

        <Card>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState title="No audit entries" description="Nothing matches this filter." />
          ) : (
            <div className="divide-y divide-border">
              {entries.map((e) => (
                <AuditRow key={e.id} entry={e} />
              ))}
            </div>
          )}

          {hasNextPage && (
            <Button variant="ghost" className="mt-4 w-full" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
              Load more
            </Button>
          )}
        </Card>
      </div>
    </AdminQueryBoundary>
  );
}

function AuditRow({ entry: e }: { entry: AuditEntry }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <ActorBadge actorType={e.actorType} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">
          <span className="font-medium">{e.action}</span>
          {e.resourceType && (
            <span className="text-ink-secondary">
              {" "}
              · {e.resourceType} {e.resourceId?.slice(0, 8)}
            </span>
          )}
        </p>
        <Caption>
          {e.userId ? `user ${e.userId.slice(0, 8)}` : "system"}
          {e.ip && ` · ${e.ip}`} · {timeAgo(e.createdAt)}
        </Caption>
        {e.metadata && Object.keys(e.metadata).length > 0 && <pre className="mt-1 font-mono text-xs text-ink-muted">{JSON.stringify(e.metadata)}</pre>}
      </div>
    </div>
  );
}

function ActorBadge({ actorType }: { actorType: string }) {
  const tone = actorType === "admin" ? "danger" : actorType === "system" ? "neutral" : "primary";
  return (
    <Badge tone={tone} className="mt-0.5 shrink-0">
      {actorType}
    </Badge>
  );
}
