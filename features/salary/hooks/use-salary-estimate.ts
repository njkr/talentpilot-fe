"use client";

import { useQuery } from "@tanstack/react-query";
import { salaryApi } from "../salary.api";

export function useSalaryEstimate(workspaceId: string, active: boolean) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "salary"],
    queryFn: () => salaryApi.get(workspaceId),
    enabled: active,
    retry: false, // estimate_salary is an optional step — a missing estimate isn't transient
  });
}
