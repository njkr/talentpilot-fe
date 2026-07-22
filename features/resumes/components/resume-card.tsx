import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Caption } from "@/components/ui/typography";
import { formatFileSize } from "@/lib/utils";
import { useResumeStatus } from "../hooks/use-resume-status";
import { ResumeStatusBadge } from "./resume-status-badge";
import { ResumeCardActions } from "./resume-card-actions";
import { isTerminal, type Resume } from "../resume.types";

export function ResumeCard({ resume }: { resume: Resume }) {
  // If this resume is still processing, poll it so the card updates without a manual refresh.
  const { data: live } = useResumeStatus(resume.id, !isTerminal(resume.status));
  const current = live ?? resume;

  return (
    <Card className="hover:border-ink-muted transition-colors">
      <Link href={`/resumes/${current.id}`} className="block">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">{current.title}</p>
            <Caption>{current.status === "parsed" ? `${current.pageCount}p · ${current.wordCount} words` : formatFileSize(current.fileSize)}</Caption>
          </div>
          <ResumeStatusBadge status={current.status} />
        </div>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <ResumeCardActions resume={current} />
      </div>
    </Card>
  );
}
