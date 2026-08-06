"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn, timeAgo } from "@/lib/utils";
import type { Resume } from "@/features/resumes/resume.types";

interface ResumePickerProps {
  resumes: Resume[];
  value: string;
  onChange: (id: string) => void;
}

export function ResumePicker({ resumes, value, onChange }: ResumePickerProps) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const query = search.trim().toLowerCase();
  const filtered = query ? resumes.filter((r) => r.title.toLowerCase().includes(query)) : resumes;

  // "Most recent" only within groups of identically-titled resumes — disambiguates look-alike
  // names, rather than a single app-wide tag that wouldn't address that specific problem.
  const mostRecentIds = new Set<string>();
  const byTitle = new Map<string, Resume[]>();
  for (const r of resumes) {
    const key = r.title.trim().toLowerCase();
    byTitle.set(key, [...(byTitle.get(key) ?? []), r]);
  }
  for (const group of byTitle.values()) {
    if (group.length > 1) {
      const newest = group.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
      mostRecentIds.add(newest.id);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Resume</span>
        {resumes.length > 4 && <Input placeholder="Search resumes" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-40" />}
      </div>

      {resumes.length === 0 ? (
        <EmptyState compact title="No resumes yet" description="Upload a resume to get started." action={{ label: "Upload resume", href: "/resumes" }} />
      ) : filtered.length === 0 ? (
        <EmptyState compact title="No resumes match your search" />
      ) : (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
          {filtered.map((r) => (
            <ResumeRow key={r.id} resume={r} selected={value === r.id} mostRecent={mostRecentIds.has(r.id)} onSelect={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}

function statusReason(status: Resume["status"]): string | null {
  if (status === "parsed") return null;
  if (status === "failed") return "Parsing failed";
  return "Still processing…";
}

function ResumeRow({ resume, selected, mostRecent, onSelect }: { resume: Resume; selected: boolean; mostRecent: boolean; onSelect: (id: string) => void }) {
  const reason = statusReason(resume.status);
  const disabled = resume.status !== "parsed";

  return (
    <label
      title={resume.status === "failed" ? (resume.parseError ?? undefined) : undefined}
      className={cn(
        "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm",
        disabled ? "cursor-not-allowed opacity-60" : cn("cursor-pointer", selected ? "bg-primary/10 text-primary" : "text-ink hover:bg-bg"),
      )}
    >
      <input type="radio" name="resume" className="sr-only" checked={selected} disabled={disabled} onChange={() => onSelect(resume.id)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate">{resume.title}</span>
          {mostRecent && <span className="shrink-0 rounded-md bg-ink/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-ink-secondary">Most recent</span>}
        </div>
        <div className="text-xs text-ink-muted">
          Uploaded {timeAgo(resume.createdAt)}
          {resume.pageCount != null && ` · ${resume.pageCount} page${resume.pageCount === 1 ? "" : "s"}`}
        </div>
        {reason && <div className="text-xs text-warning">{reason}</div>}
      </div>
    </label>
  );
}
