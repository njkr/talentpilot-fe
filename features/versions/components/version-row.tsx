import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import { cn, timeAgo } from "@/lib/utils";
import type { ResumeVersion } from "../version.types";

interface VersionRowProps {
  version: ResumeVersion;
  isCurrent: boolean;
  isLast: boolean;
  onCompare: () => void;
  onRestore: () => void;
  restoring: boolean;
}

export function VersionRow({ version, isCurrent, isLast, onCompare, onRestore, restoring }: VersionRowProps) {
  return (
    <div className="flex gap-3 py-3">
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <div className={cn("h-2.5 w-2.5 rounded-full", isCurrent ? "bg-primary ring-4 ring-primary/15" : "bg-border")} />
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      <div className="min-w-0 flex-1 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink">v{version.version}</span>
          <span className="text-sm text-ink-secondary">{version.label}</span>
          {isCurrent && <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Current</span>}
          <VersionOriginBadge createdBy={version.createdBy} />
        </div>

        <Caption className="mt-0.5 block">
          {version.changeSummary} · {timeAgo(version.createdAt)}
        </Caption>

        {!isCurrent && (
          <div className="mt-2 flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCompare}>
              Compare to current
            </Button>
            <Button variant="ghost" size="sm" onClick={onRestore} loading={restoring}>
              Restore
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Where the version came from — 'ai' (applied suggestions), 'restore', or the original upload.
const originConfig: Record<ResumeVersion["createdBy"], { label: string; className: string }> = {
  user: { label: "Uploaded", className: "bg-ink-muted/10 text-ink-secondary" },
  ai: { label: "Optimized", className: "bg-success/10 text-success" },
  restore: { label: "Restored", className: "bg-warning/10 text-warning" },
};

function VersionOriginBadge({ createdBy }: { createdBy: ResumeVersion["createdBy"] }) {
  const c = originConfig[createdBy];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}
