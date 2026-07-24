"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { versionApi } from "../version.api";
import type { ResumeVersion } from "../version.types";
import type { Resume } from "@/features/resumes/resume.types";

/**
 * Confirmed live (backend verification report Finding 3): GET /resumes/:id/versions returns ONLY
 * explicit version-creation events (apply-suggestions or restore). A resume that has never had
 * either returns an EMPTY ARRAY — even though it obviously exists "at version 1" (verified: a
 * resume with a real v2 from an applied suggestion still omits v1 from the list entirely).
 *
 * Empty is NOT an error state. We synthesize the v1 entry from the resume's own createdAt so the
 * history screen always shows a complete, truthful timeline starting at the original upload.
 */
export function useVersions(resumeId: string, resume?: Resume) {
  const query = useQuery({
    queryKey: ["resumes", resumeId, "versions"],
    queryFn: () => versionApi.list(resumeId),
  });

  const versions = useMemo(() => {
    const fromApi = query.data ?? [];
    const hasV1 = fromApi.some((v) => v.version === 1);
    if (hasV1 || !resume) return fromApi;

    const syntheticV1: ResumeVersion = {
      id: `synthetic-v1-${resumeId}`,
      version: 1,
      label: "Original upload",
      changeSummary: "Your resume as uploaded",
      createdBy: "user",
      suggestionsApplied: 0,
      createdAt: resume.createdAt,
      isSynthesized: true,
    };
    return [syntheticV1, ...fromApi];
  }, [query.data, resume, resumeId]);

  // Newest first for display. The API already returns newest-first, but sort defensively rather
  // than depend on that ordering holding once the synthesized v1 is spliced in.
  const sorted = useMemo(() => [...versions].sort((a, b) => b.version - a.version), [versions]);

  return { ...query, versions: sorted };
}
