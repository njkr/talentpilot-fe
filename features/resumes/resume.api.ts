import { api } from "@/lib/api/client";
import type { Resume, ResumeSection, SectionType } from "./resume.types";

export const resumeApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    // No Content-Type here — lib/api/client.ts detects FormData and lets the browser set the
    // multipart boundary itself.
    return api.post<Resume>("/resumes/upload", form);
  },
  list: (cursor?: string) => api.list<Resume[]>("/resumes", cursor ? { cursor } : undefined),
  get: (id: string) => api.get<Resume>(`/resumes/${id}`),
  rename: (id: string, title: string) => api.patch<Resume>(`/resumes/${id}`, { title }),
  remove: (id: string) => api.del<void>(`/resumes/${id}`),
  retry: (id: string) => api.post<Resume>(`/resumes/${id}/retry`),
  sections: (id: string) => api.get<ResumeSection[]>(`/resumes/${id}/sections`),
  updateSection: (id: string, type: SectionType, content: unknown) => api.patch<ResumeSection>(`/resumes/${id}/sections/${type}`, { content }),
};
