"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { jobApi } from "../job.api";

export function usePasteJob() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: jobApi.paste,
    onSuccess: (jd) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      // The response is already analyzed — go straight to the parsed view.
      router.push(`/jobs/${jd.id}`);
    },
  });
}

export function useUploadJob() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: jobApi.upload,
    onSuccess: (jd) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      router.push(`/jobs/${jd.id}`);
    },
  });
}
