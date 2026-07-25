import { api } from "@/lib/api/client";
import type { CompanyInsight } from "./company.types";

export const companyApi = {
  get: (workspaceId: string) => api.get<CompanyInsight>(`/workspaces/${workspaceId}/company-insight`),
};
