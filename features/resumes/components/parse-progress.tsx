import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { H3, Body } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { Resume, ResumeStatus } from "../resume.types";

const STAGES: { key: ResumeStatus; label: string }[] = [
  { key: "uploaded", label: "Uploaded" },
  { key: "extracting", label: "Reading the file" },
  { key: "extracted", label: "Text extracted" },
  { key: "parsing", label: "Understanding your resume" },
];

export function ParseProgress({ resume, stuck, onRetry, retrying }: { resume: Resume; stuck: boolean; onRetry: () => void; retrying?: boolean }) {
  if (resume.status === "failed") {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div className="flex-1">
            <H3>We couldn&apos;t process this resume</H3>
            <Body className="mt-1">{resume.parseError ?? "The file could not be read."}</Body>
            <Button variant="secondary" className="mt-3" onClick={onRetry} loading={retrying}>
              Try again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === resume.status);

  return (
    <Card>
      <div className="space-y-3">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={stage.key} className="flex items-center gap-3">
              {done ? (
                <CheckCircleIcon className="h-5 w-5 text-success" />
              ) : active ? (
                <Spinner className="h-5 w-5 text-primary" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-border" />
              )}
              <span className={cn("text-sm", done ? "text-ink-secondary" : active ? "font-medium text-ink" : "text-ink-muted")}>{stage.label}</span>
            </div>
          );
        })}
      </div>

      {stuck && (
        // Sitting at uploaded/extracted too long means the worker isn't running — an ops
        // problem, not a data problem. Say so honestly instead of spinning forever.
        <div className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">This is taking longer than usual. Processing may be delayed — check back shortly.</div>
      )}
    </Card>
  );
}
