"use client";

import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Caption } from "@/components/ui/typography";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn, timeAgo } from "@/lib/utils";
import { displayPosition, type JobDescription } from "@/features/jobs/job.types";

interface JobPickerProps {
  jobs: JobDescription[];
  value: string;
  onChange: (id: string) => void;
}

export function JobPicker({ jobs, value, onChange }: JobPickerProps) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);
  const selected = jobs.find((j) => j.id === value);

  const query = search.trim().toLowerCase();
  const filtered = query ? jobs.filter((j) => displayPosition(j).toLowerCase().includes(query) || (j.company ?? "").toLowerCase().includes(query)) : jobs;

  // Duplicate position+company groups -> "1 of N" ordinal labels (not just newest-wins, unlike
  // resumes — the user may deliberately want an older duplicate they already ran a workspace against).
  const dupLabels = new Map<string, string>();
  const byKey = new Map<string, JobDescription[]>();
  for (const j of jobs) {
    const key = `${displayPosition(j).toLowerCase().trim()}|${(j.company ?? "").toLowerCase().trim()}`;
    byKey.set(key, [...(byKey.get(key) ?? []), j]);
  }
  for (const group of byKey.values()) {
    if (group.length > 1) {
      const ordered = [...group].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      ordered.forEach((j, i) => dupLabels.set(j.id, `${i + 1} of ${ordered.length}`));
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Job description</span>
        {jobs.length > 4 && <Input placeholder="Search jobs" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-40" />}
      </div>

      {jobs.length === 0 ? (
        <EmptyState compact title="No job descriptions yet" description="Add a job description to get started." action={{ label: "Add a job description", href: "/jobs/new" }} />
      ) : filtered.length === 0 ? (
        <EmptyState compact title="No jobs match your search" />
      ) : (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
          {filtered.map((j) => (
            <JobRow key={j.id} job={j} selected={value === j.id} duplicateLabel={dupLabels.get(j.id)} onSelect={onChange} />
          ))}
        </div>
      )}

      {selected && selected.missingFields.length > 0 && (
        <Caption className="block text-warning">This job description is missing {selected.missingFields.join(" and ")}. Analysis will still run but skip company research.</Caption>
      )}
    </div>
  );
}

function statusReason(status: JobDescription["status"]): string | null {
  if (status === "analyzed") return null;
  if (status === "failed") return "Analysis failed";
  return "Still analyzing…";
}

function JobRow({ job, selected, duplicateLabel, onSelect }: { job: JobDescription; selected: boolean; duplicateLabel: string | undefined; onSelect: (id: string) => void }) {
  const reason = statusReason(job.status);
  const disabled = job.status !== "analyzed";
  const requiredCount = job.parsedData?.requirements.filter((r) => r.importance === "required").length ?? null;

  return (
    <label
      className={cn(
        "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm",
        disabled ? "cursor-not-allowed opacity-60" : cn("cursor-pointer", selected ? "bg-primary/10 text-primary" : "text-ink hover:bg-bg"),
      )}
    >
      <input type="radio" name="job" className="sr-only" checked={selected} disabled={disabled} onChange={() => onSelect(job.id)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate">
            {displayPosition(job)}
            {job.company ? ` — ${job.company}` : ""}
          </span>
          {duplicateLabel && <span className="shrink-0 rounded-md bg-warning/10 px-1.5 py-0.5 text-[11px] font-medium text-warning">{duplicateLabel}</span>}
          {/* Soft nudge, not a block — just flags that this JD is missing a company/position
              before the user commits to a (credit-charging) analysis on it. */}
          {job.missingFields.length > 0 && <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-label="Missing company or position" />}
        </div>
        <div className="text-xs text-ink-muted">
          {requiredCount != null && `${requiredCount} required skill${requiredCount === 1 ? "" : "s"} · `}
          added {timeAgo(job.createdAt)}
        </div>
        {reason && <div className="text-xs text-warning">{reason}</div>}
      </div>
    </label>
  );
}
