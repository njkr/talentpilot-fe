import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { H1, Caption } from "@/components/ui/typography";
import { ResumeStatusBadge } from "./resume-status-badge";
import { formatFileSize } from "@/lib/utils";
import type { Resume } from "../resume.types";

export function ResumeHeader({ resume }: { resume: Resume }) {
  return (
    <div>
      <Link href="/resumes" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" />
        Resumes
      </Link>
      <div className="flex items-center gap-3">
        <H1>{resume.title}</H1>
        <ResumeStatusBadge status={resume.status} />
      </div>
      <Caption>{resume.status === "parsed" ? `${resume.pageCount}p · ${resume.wordCount} words` : formatFileSize(resume.fileSize)}</Caption>
    </div>
  );
}
