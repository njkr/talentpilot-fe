import { api } from "@/lib/api/client";
import type { ResumeVersion, SectionDiff } from "./version.types";

export const versionApi = {
  list: (resumeId: string) => api.get<ResumeVersion[]>(`/resumes/${resumeId}/versions`),
  diff: (resumeId: string, from: number, to: number) => api.get<SectionDiff[]>(`/resumes/${resumeId}/versions/diff`, { from, to }),
  // Confirmed live response shape: { version: number } — restore is forward-only, this is the
  // new (higher) version number, never the one being restored.
  restore: (resumeId: string, version: number) => api.post<{ version: number }>(`/resumes/${resumeId}/versions/${version}/restore`),
};
