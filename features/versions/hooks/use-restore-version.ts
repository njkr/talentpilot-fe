"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { versionApi } from "../version.api";

export function useRestoreVersion(resumeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (version: number) => versionApi.restore(resumeId, version),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["resumes", resumeId] });
      qc.invalidateQueries({ queryKey: ["resumes", resumeId, "versions"] });
      qc.invalidateQueries({ queryKey: ["resumes", resumeId, "sections"] });
      // Restoring v1 while on v3 creates v4 — say the new number so the forward-only model is obvious.
      toast(`Restored as version ${res.version}. Your previous versions are unchanged.`, "success");
    },
  });
}
