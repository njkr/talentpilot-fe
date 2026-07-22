"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../job.api";

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: jobApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
