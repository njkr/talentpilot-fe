"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeHeader } from "@/features/resumes/components/resume-header";
import { ParseProgress } from "@/features/resumes/components/parse-progress";
import { SectionList } from "@/features/resumes/components/section-list";
import { useResumeStatus } from "@/features/resumes/hooks/use-resume-status";
import { useRetryResume } from "@/features/resumes/hooks/use-retry-resume";

export default function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: resume, stuck, isLoading } = useResumeStatus(id);
  const retry = useRetryResume();

  if (isLoading) return <ResumeDetailSkeleton />;
  if (!resume) return null;

  // Not yet parsed -> show the walk (still polling under the hood).
  if (resume.status !== "parsed") {
    return (
      <div className="space-y-6">
        <ResumeHeader resume={resume} />
        <ParseProgress resume={resume} stuck={stuck} onRetry={() => retry.mutate(resume.id)} retrying={retry.isPending} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResumeHeader resume={resume} />
      <SectionList resumeId={resume.id} />
    </div>
  );
}

function ResumeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
