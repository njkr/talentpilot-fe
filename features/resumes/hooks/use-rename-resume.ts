"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../resume.api";

export function useRenameResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => resumeApi.rename(id, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes"] }),
  });
}
