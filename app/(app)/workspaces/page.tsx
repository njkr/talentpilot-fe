"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { workspaceApi } from "@/features/workspaces/workspace.api";
import { WorkspaceCard } from "@/features/workspaces/components/workspace-card";
import { CreateWorkspaceDialog } from "@/features/workspaces/components/create-workspace-dialog";
import type { WorkspaceStatus } from "@/features/workspaces/workspace.types";

function WorkspacesPageInner() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["workspaces"], queryFn: () => workspaceApi.list() });

  // GET /workspaces has no server-side status filter (confirmed live — a `?status=` param 400s
  // with VALIDATION_FAILED), so the dashboard's "1 run failed" action item's `?filter=failed` link
  // is honored client-side against the already-fetched list instead.
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get("filter") as WorkspaceStatus | null;
  const items = filter ? (data?.data.filter((ws) => ws.status === filter) ?? []) : (data?.data ?? []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H1>Workspaces</H1>
          <Body>Pair a resume with a job description and run the analysis.</Body>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="sm:shrink-0">
          New analysis
        </Button>
      </div>

      {filter && (
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          Showing <span className="font-medium text-ink">{filter}</span> only
          <button onClick={() => router.push("/workspaces")} className="text-primary hover:text-primary-hover">
            Clear
          </button>
        </div>
      )}

      {isLoading ? (
        <WorkspaceListSkeleton />
      ) : !items.length ? (
        filter ? (
          <EmptyState title={`No ${filter} workspaces`} description="Nothing matches this filter right now." action={{ label: "Show all workspaces", href: "/workspaces" }} />
        ) : (
          <EmptyState title="No workspaces yet" description="Create one from a parsed resume and an analyzed job description." action={{ label: "New analysis", onClick: () => setDialogOpen(true) }} />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}

      <CreateWorkspaceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

function WorkspaceListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export default function WorkspacesPage() {
  return (
    <Suspense fallback={<WorkspaceListSkeleton />}>
      <WorkspacesPageInner />
    </Suspense>
  );
}
