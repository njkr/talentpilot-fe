"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChip } from "@/components/ui/filter-chip";
import { H1, Caption } from "@/components/ui/typography";
import { timeAgo } from "@/lib/utils";
import { useDeadLetterQueue, useRetryDeadJob } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { DeadLetterJob } from "../admin.types";

// Confirmed live in the API doc's own prose (Sprint 9-11 architecture section): the worker
// consumes emails/resumes/pipeline, and Sprint 9 added a fourth, documents — matches the sprint
// doc's own guessed list exactly, for once.
const QUEUES = ["pipeline", "resumes", "emails", "documents"] as const;

export function DeadLetterQueue() {
  const [queue, setQueue] = useState<(typeof QUEUES)[number]>("pipeline");
  const { data, error } = useDeadLetterQueue(queue);
  const retry = useRetryDeadJob(queue);

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H1>Dead-letter queue</H1>
          <div className="flex gap-1">
            {QUEUES.map((q) => (
              <FilterChip key={q} active={queue === q} onClick={() => setQueue(q)}>
                {q}
              </FilterChip>
            ))}
          </div>
        </div>

        {!data?.length ? (
          <EmptyState title={`No failed jobs in "${queue}"`} description="Everything's processing cleanly." />
        ) : (
          <div className="space-y-3">
            {data.map((job) => (
              <JobCard key={job.id} job={job} onRetry={() => retry.mutate(job.id)} retrying={retry.isPending && retry.variables === job.id} />
            ))}
          </div>
        )}
      </div>
    </AdminQueryBoundary>
  );
}

function JobCard({ job, onRetry, retrying }: { job: DeadLetterJob; onRetry: () => void; retrying: boolean }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-sm text-ink">
            {job.name} · {job.id}
          </p>
          <Caption className="mt-0.5 block">
            {job.attemptsMade} attempts · failed {timeAgo(new Date(job.timestamp).toISOString())}
          </Caption>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-danger/[0.06] p-2 font-mono text-xs text-danger">{job.failedReason}</pre>
        </div>
        <Button size="sm" variant="secondary" loading={retrying} onClick={onRetry} className="shrink-0">
          Requeue
        </Button>
      </div>
      {/* The job's data payload — expandable, for inspecting what it was trying to do. Plain
          <details>/<summary> rather than a JS-driven disclosure: free keyboard/screen-reader
          support, no extra state for a purely-local expand/collapse. */}
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-ink-secondary hover:text-ink">Job data</summary>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-bg p-2 font-mono text-xs text-ink-secondary">{JSON.stringify(job.data, null, 2)}</pre>
      </details>
    </Card>
  );
}
