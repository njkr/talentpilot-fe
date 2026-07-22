import { api } from "@/lib/api/client";

// Shape confirmed live against GET /dashboard (2026-07-22) — flatter than a first guess would
// suggest: no plan.limits object, resumes carries its own {count,limit}, workspaces has no limit
// field at all (only totals/breakdown + the 5 most recent).
export interface DashboardData {
  creditBalance: number;
  plan: { key: string; name: string; status: string; monthlyCredits: number };
  resumes: { count: number; limit: number };
  workspaces: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
    recent: Array<{
      id: string;
      name: string;
      status: "created" | "queued" | "processing" | "completed" | "partial" | "failed";
      updatedAt: string;
    }>;
  };
  unreadNotifications: number;
}

export const dashboardApi = {
  get: () => api.get<DashboardData>("/dashboard"),
};
