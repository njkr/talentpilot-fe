"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../resume.api";
import type { SectionType } from "../resume.types";

export function useUpdateSection(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, content }: { type: SectionType; content: unknown }) => resumeApi.updateSection(resumeId, type, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes", resumeId, "sections"] }),
  });
}
