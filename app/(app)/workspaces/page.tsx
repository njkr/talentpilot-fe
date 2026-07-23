"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { workspaceApi } from "@/features/workspaces/workspace.api";
import { WorkspaceCard } from "@/features/workspaces/components/workspace-card";
import { CreateWorkspaceDialog } from "@/features/workspaces/components/create-workspace-dialog";

export default function WorkspacesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["workspaces"], queryFn: () => workspaceApi.list() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1>Workspaces</H1>
          <Body>Pair a resume with a job description and run the analysis.</Body>
        </div>
        <Button onClick={() => setDialogOpen(true)}>New analysis</Button>
      </div>

      {isLoading ? (
        <WorkspaceListSkeleton />
      ) : !data?.data.length ? (
        <EmptyState title="No workspaces yet" description="Create one from a parsed resume and an analyzed job description." action={{ label: "New analysis", onClick: () => setDialogOpen(true) }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.data.map((ws) => (
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
