import { cn } from "@/lib/utils";
import type { Resume } from "@/features/resumes/resume.types";

interface ResumePickerProps {
  resumes: Resume[];
  value: string;
  onChange: (id: string) => void;
  emptyHint: string;
}

export function ResumePicker({ resumes, value, onChange, emptyHint }: ResumePickerProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-ink">Resume</span>
      {resumes.length === 0 ? (
        <p className="text-sm text-ink-secondary">{emptyHint}</p>
      ) : (
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
          {resumes.map((r) => (
            <label
              key={r.id}
              className={cn("flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm", value === r.id ? "bg-primary/10 text-primary" : "text-ink hover:bg-bg")}
            >
              <input type="radio" name="resume" className="sr-only" checked={value === r.id} onChange={() => onChange(r.id)} />
              <span className="truncate">{r.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
