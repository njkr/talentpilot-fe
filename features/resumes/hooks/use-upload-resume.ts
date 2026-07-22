"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../resume.api";

export function useUploadResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resumeApi.upload,
    onSuccess: () => {
      // Refresh the list so the new (uploaded) resume appears immediately with its polling card.
      qc.invalidateQueries({ queryKey: ["resumes"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] }); // resume count changed
    },
  });
}
