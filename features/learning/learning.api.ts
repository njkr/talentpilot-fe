import { api } from "@/lib/api/client";
import type { LearningRoadmap } from "./learning.types";

export const learningApi = {
  get: (workspaceId: string) => api.get<LearningRoadmap>(`/workspaces/${workspaceId}/learning-roadmap`),
};
