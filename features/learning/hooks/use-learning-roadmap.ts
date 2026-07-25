"use client";

import { useQuery } from "@tanstack/react-query";
import { learningApi } from "../learning.api";

export function useLearningRoadmap(workspaceId: string, active: boolean) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "learning"],
    queryFn: () => learningApi.get(workspaceId),
    enabled: active,
  });
}
