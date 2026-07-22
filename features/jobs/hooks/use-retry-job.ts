"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../job.api";

export function useRetryJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: jobApi.retry,
    onSuccess: (jd) => qc.invalidateQueries({ queryKey: ["jobs", jd.id] }),
  });
}
