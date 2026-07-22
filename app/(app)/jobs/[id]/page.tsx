"use client";

import { use } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Body } from "@/components/ui/typography";
import { useJobStatus } from "@/features/jobs/hooks/use-job-status";
import { JobHeader } from "@/features/jobs/components/job-header";
import { JobFailedCard } from "@/features/jobs/components/job-failed-card";
import { RequirementsCard } from "@/features/jobs/components/requirements-card";
import { SkillsCard } from "@/features/jobs/components/skills-card";
import { ResponsibilitiesCard } from "@/features/jobs/components/responsibilities-card";
import { KeywordsCard } from "@/features/jobs/components/keywords-card";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: jd, isLoading } = useJobStatus(id);

  if (isLoading) return <JobDetailSkeleton />;
  if (!jd) return null;

  if (jd.status === "analyzing") {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5 text-primary" />
          <Body>Analyzing this job description…</Body>
        </div>
      </Card>
    );
  }
  if (jd.status === "failed") {
    return <JobFailedCard jd={jd} />;
  }

  const p = jd.parsedData!;
  return (
    <div className="space-y-6">
      <JobHeader jd={jd} />
      <RequirementsCard requirements={p.requirements} />
      <SkillsCard skills={p.skills} />
      <ResponsibilitiesCard items={p.responsibilities} />
      <KeywordsCard keywords={p.keywords} />
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
