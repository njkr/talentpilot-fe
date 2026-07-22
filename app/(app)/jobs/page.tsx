"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { JobCard } from "@/features/jobs/components/job-card";
import { jobApi } from "@/features/jobs/job.api";

export default function JobsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["jobs"], queryFn: () => jobApi.list() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1>Jobs</H1>
          <Body>Job descriptions you&apos;re targeting.</Body>
        </div>
        <Button asChild>
          <Link href="/jobs/new">Add job description</Link>
        </Button>
      </div>

      {isLoading ? (
        <JobListSkeleton />
      ) : !data?.data.length ? (
        <EmptyState title="No job descriptions yet" description="Add a job posting to match your resume against it." action={{ label: "Add one", href: "/jobs/new" }} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.data.map((jd) => (
            <JobCard key={jd.id} jd={jd} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
