"use client";

import { useQuery } from "@tanstack/react-query";
import { H1, Body } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { UploadDropzone } from "@/features/resumes/components/upload-dropzone";
import { ResumeCard } from "@/features/resumes/components/resume-card";
import { resumeApi } from "@/features/resumes/resume.api";

export default function ResumesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => resumeApi.list(),
  });

  return (
    <div className="space-y-6">
      <div>
        <H1>Resumes</H1>
        <Body>Upload and manage your resumes.</Body>
      </div>

      <UploadDropzone />

      {isLoading ? (
        <ResumeListSkeleton />
      ) : !data?.data.length ? (
        <EmptyState title="No resumes yet" description="Upload your first resume to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.data.map((r) => (
            <ResumeCard key={r.id} resume={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResumeListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
