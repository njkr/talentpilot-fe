"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { H3 } from "@/components/ui/typography";
import { useVersions } from "../hooks/use-versions";
import { useRestoreVersion } from "../hooks/use-restore-version";
import { VersionRow } from "./version-row";
import { VersionDiff } from "./version-diff";
import { RestoreConfirm } from "./restore-confirm";
import type { Resume } from "@/features/resumes/resume.types";

export function VersionList({ resumeId, resume }: { resumeId: string; resume: Resume }) {
  const { versions, isLoading } = useVersions(resumeId, resume);
  const [compare, setCompare] = useState<{ from: number; to: number } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<number | null>(null);
  const restore = useRestoreVersion(resumeId);

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!versions.length) return null;

  // The forward-only model means the highest version number is always the current one — there is
  // no separate "currentVersion" field on the resume itself.
  const current = Math.max(...versions.map((v) => v.version));

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <H3>Version history</H3>
          {versions.length > 1 && (
            <Button variant="secondary" size="sm" onClick={() => setCompare({ from: versions[1].version, to: versions[0].version })}>
              Compare latest two
            </Button>
          )}
        </div>

        {/* Timeline — newest at top, current version marked. */}
        <div className="relative space-y-1">
          {versions.map((v, i) => (
            <VersionRow
              key={v.id}
              version={v}
              isCurrent={v.version === current}
              isLast={i === versions.length - 1}
              onCompare={() => setCompare({ from: v.version, to: current })}
              onRestore={() => setConfirmRestore(v.version)}
              restoring={restore.isPending && restore.variables === v.version}
            />
          ))}
        </div>
      </Card>

      {compare && <VersionDiff resumeId={resumeId} from={compare.from} to={compare.to} onClose={() => setCompare(null)} />}

      {confirmRestore != null && (
        <RestoreConfirm
          open
          onClose={() => setConfirmRestore(null)}
          version={confirmRestore}
          currentVersion={current}
          restoring={restore.isPending}
          onConfirm={() =>
            restore.mutate(confirmRestore, {
              onSuccess: () => setConfirmRestore(null),
            })
          }
        />
      )}
    </div>
  );
}
