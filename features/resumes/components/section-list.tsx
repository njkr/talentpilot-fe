"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { resumeApi } from "../resume.api";
import { SectionCard } from "./section-card";

export function SectionList({ resumeId }: { resumeId: string }) {
  const { data: sections, isLoading } = useQuery({
    queryKey: ["resumes", resumeId, "sections"],
    queryFn: () => resumeApi.sections(resumeId),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!sections?.length) return <EmptyState title="No sections were extracted" />;

  // Render in the backend's orderIndex order.
  const ordered = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4">
      {ordered.map((section) => (
        <SectionCard key={section.sectionType} resumeId={resumeId} section={section} />
      ))}
    </div>
  );
}
