"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../resume.api";

export function useRetryResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resumeApi.retry,
    onSuccess: (resume) => qc.invalidateQueries({ queryKey: ["resumes", resume.id] }),
  });
}
