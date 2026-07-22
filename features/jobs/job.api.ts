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
};
