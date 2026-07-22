"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../resume.api";

// A resume attached to a workspace can't be deleted (backend RESTRICT). The 409 RESUME_IN_USE
// carries the blocking workspaces in details.workspaces — the caller (ResumeCardActions) reads
// mutation.error itself and renders that list rather than a generic failure message.
export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resumeApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
