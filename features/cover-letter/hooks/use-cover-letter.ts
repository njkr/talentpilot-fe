"use client";

import { useQuery } from "@tanstack/react-query";
import { coverLetterApi } from "../cover-letter.api";

export function useCoverLetter(workspaceId: string, active: boolean) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "cover-letter"],
    queryFn: () => coverLetterApi.get(workspaceId),
    enabled: active,
  });
}
