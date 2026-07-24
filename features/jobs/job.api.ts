import { api } from "@/lib/api/client";
import type { JobDescription } from "./job.types";

export const jobApi = {
  paste: (body: { text: string; position?: string; company?: string }) => api.post<JobDescription>("/job-descriptions/paste", body),
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    // No Content-Type here — lib/api/client.ts detects FormData and lets the browser set the boundary.
    return api.post<JobDescription>("/job-descriptions/upload", form);
  },
  list: (cursor?: string) => api.list<JobDescription[]>("/job-descriptions", cursor ? { cursor } : undefined),
  get: (id: string) => api.get<JobDescription>(`/job-descriptions/${id}`),
  retry: (id: string) => api.post<JobDescription>(`/job-descriptions/${id}/retry`),
  remove: (id: string) => api.del<void>(`/job-descriptions/${id}`),
  // Direct field correction, NOT a re-parse — confirmed live: parsedData is untouched, only the
  // top-level company/position change. Both fields optional; send only what's being fixed
  // (omission, not "", means "don't touch this field" — the backend rejects an empty string).
  update: (id: string, body: { company?: string; position?: string }) => api.patch<JobDescription>(`/job-descriptions/${id}`, body),
};
