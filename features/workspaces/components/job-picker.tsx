import { cn } from "@/lib/utils";
import type { JobDescription } from "@/features/jobs/job.types";

interface JobPickerProps {
  jobs: JobDescription[];
  value: string;
  onChange: (id: string) => void;
  emptyHint: string;
}

export function JobPicker({ jobs, value, onChange, emptyHint }: JobPickerProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-ink">Job description</span>
      {jobs.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyHint}</p>
      ) : (
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
          {jobs.map((j) => (
            <label
              key={j.id}
              className={cn("flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm", value === j.id ? "bg-primary/10 text-primary" : "text-ink hover:bg-bg")}
            >
              <input type="radio" name="job" className="sr-only" checked={value === j.id} onChange={() => onChange(j.id)} />
              <span className="truncate">
                {j.position ?? "Untitled role"}
                {j.company ? ` — ${j.company}` : ""}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
