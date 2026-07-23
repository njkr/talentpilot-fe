import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Caption } from "@/components/ui/typography";
import { StatusBadge } from "@/components/ui/status-badge";
import { timeAgo } from "@/lib/utils";
import type { Workspace } from "../workspace.types";

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const href = workspace.lastRunId && workspace.status !== "created" ? `/workspaces/${workspace.id}?run=${workspace.lastRunId}` : `/workspaces/${workspace.id}`;

  return (
    <Card className="hover:border-ink-muted transition-colors">
      <Link href={href} className="block">
        <div className="flex items-start justify-between">
          <p className="font-medium text-ink truncate">{workspace.name}</p>
          <StatusBadge status={workspace.status} />
        </div>
        <Caption>{timeAgo(workspace.createdAt)}</Caption>
      </Link>
    </Card>
  );
}
