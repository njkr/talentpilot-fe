import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { H1 } from "@/components/ui/typography";
import { StatusBadge } from "@/components/ui/status-badge";
import { DownloadMenu } from "@/features/documents/components/download-menu";
import type { Workspace } from "../workspace.types";

export function WorkspaceHeader({ workspace }: { workspace: Workspace }) {
  return (
    <div>
      <Link href="/workspaces" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" />
        Workspaces
      </Link>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <H1>{workspace.name}</H1>
          <StatusBadge status={workspace.status} />
        </div>
        {/* Downloads need something to render from — gate on lastRunId the same way the page
            itself gates showing WorkspaceView, so a never-analyzed workspace doesn't show a
            menu that can only ever fail. */}
        {workspace.lastRunId && <DownloadMenu workspaceId={workspace.id} />}
      </div>
    </div>
  );
}
