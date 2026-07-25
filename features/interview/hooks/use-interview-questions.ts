"use client";

import { useQuery } from "@tanstack/react-query";
import { interviewApi } from "../interview.api";

export function useInterviewQuestions(workspaceId: string, active: boolean) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "interview"],
    queryFn: () => interviewApi.list(workspaceId),
    enabled: active,
  });
}
