import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { displayPosition, type JobDescription } from "@/features/jobs/job.types";

interface JobPickerProps {
  jobs: JobDescription[];
  value: string;
  onChange: (id: string) => void;
  emptyHint: string;
}

export function JobPicker({ jobs, value, onChange, emptyHint }: JobPickerProps) {
  const selected = jobs.find((j) => j.id === value);

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
              <span className="min-w-0 flex-1 truncate">
                {displayPosition(j)}
                {j.company ? ` — ${j.company}` : ""}
              </span>
              {/* Soft nudge, not a block — just flags that this JD is missing a company/position
                  before the user commits to a (credit-charging) analysis on it. */}
              {j.missingFields.length > 0 && <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-label="Missing company or position" />}
            </label>
          ))}
        </div>
      )}
      {selected && selected.missingFields.length > 0 && (
        <Caption className="block text-warning">This job description is missing {selected.missingFields.join(" and ")}. Analysis will still run but skip company research.</Caption>
      )}
    </div>
  );
}
