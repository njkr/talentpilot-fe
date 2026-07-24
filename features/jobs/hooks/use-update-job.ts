"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../job.api";

export function useUpdateJob(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { company?: string; position?: string }) => jobApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs", id] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
