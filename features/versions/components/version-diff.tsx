"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Body, Caption } from "@/components/ui/typography";
import { versionApi } from "../version.api";
import type { DiffChange } from "../version.types";

interface VersionDiffProps {
  resumeId: string;
  from: number;
  to: number;
  onClose: () => void;
}

export function VersionDiff({ resumeId, from, to, onClose }: VersionDiffProps) {
  const { data: diffs, isLoading } = useQuery({
    queryKey: ["resumes", resumeId, "diff", from, to],
    queryFn: () => versionApi.diff(resumeId, from, to),
  });

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <H3>
          Changes from v{from} to v{to}
        </H3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : !diffs?.length ? (
        <Body>No differences between these versions.</Body>
      ) : (
        <div className="space-y-5">
          {diffs
            .filter((d) => d.changed)
            .map((d) => (
              <div key={d.sectionType}>
                <Caption className="mb-1.5 block capitalize">{d.sectionType.replace("_", " ")}</Caption>
                <div className="rounded-lg border border-border bg-bg/50 p-3 text-sm leading-relaxed">
                  <DiffText changes={d.changes} />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Legend — makes the color coding unambiguous. */}
      <div className="mt-4 flex gap-4 border-t border-border pt-3">
        <Caption>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-success/40" />
          Added
        </Caption>
        <Caption>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-danger/40" />
          Removed
        </Caption>
      </div>
    </Card>
  );
}

// Renders the diff spans inline, like track changes in a word processor. The backend's `changes`
// array is already in document order (added/removed/unchanged interleaved) — don't re-sort or
// group, the order IS the document. whitespace-pre-wrap preserves the newlines the backend
// includes between experience entries.
function DiffText({ changes }: { changes: DiffChange[] }) {
  return (
    <p className="whitespace-pre-wrap">
      {changes.map((c, i) => {
        if (c.added) return (
          <span key={i} className="rounded-sm bg-success/15 text-success px-0.5">
            {c.value}
          </span>
        );
        if (c.removed) return (
          <span key={i} className="rounded-sm bg-danger/15 text-danger px-0.5 line-through decoration-danger/50">
            {c.value}
          </span>
        );
        return (
          <span key={i} className="text-ink-secondary">
            {c.value}
          </span>
        );
      })}
    </p>
  );
}
