import { api } from "@/lib/api/client";
import type { SalaryEstimate } from "./salary.types";

export const salaryApi = {
  get: (workspaceId: string) => api.get<SalaryEstimate>(`/workspaces/${workspaceId}/salary-estimate`),
};
