"use client";

import { useQuery } from "@tanstack/react-query";
import { companyApi } from "../company.api";

export function useCompanyInsight(workspaceId: string, active: boolean) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "company"],
    queryFn: () => companyApi.get(workspaceId),
    enabled: active,
    retry: false, // research_company is an optional step — a missing insight isn't transient
  });
}
