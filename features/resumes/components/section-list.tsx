"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { resumeApi } from "../resume.api";
import { SectionCard } from "./section-card";
import type { ResumeSection, SectionType } from "../resume.types";

export function SectionList({ resumeId }: { resumeId: string }) {
  const { data: sections, isLoading } = useQuery({
    queryKey: ["resumes", resumeId, "sections"],
    queryFn: () => resumeApi.sections(resumeId),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!sections?.length) return <EmptyState title="No sections were extracted" />;

  // ⚠️ Confirmed live 2026-07-29: GET /resumes/:id/sections has a real backend bug — it returns
  // one full duplicate row-set per historical resume version instead of filtering to the current
  // one (a resume with N version-creating events comes back with N copies of every section). Dedupe
  // defensively by sectionType, keeping the LAST occurrence — the duplicate sets are in version-
  // chronological order, so "last" is the current version's data. A Map's keys are unique by
  // construction, so this also fixes the `key={section.sectionType}` collision (and the resulting
  // "two children with the same key" console warning) as a side effect of fixing the real bug,
  // rather than papering over it with a synthetic index key.
  const deduped = [...sections.reduce((map, s) => map.set(s.sectionType, s), new Map<SectionType, ResumeSection>()).values()];

  // Render in the backend's orderIndex order.
  const ordered = deduped.sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4">
      {ordered.map((section) => (
        <SectionCard key={section.sectionType} resumeId={resumeId} section={section} />
      ))}
    </div>
  );
}
