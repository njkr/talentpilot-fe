"use client";

import { usePollUntil } from "@/hooks/use-poll-until";
import { jobApi } from "../job.api";
import { isJobTerminal, type JobDescription } from "../job.types";

// Only the upload path can come back non-terminal — paste always returns 'analyzed' on the first
// response, so the very first fetch here already satisfies isJobTerminal and polling stops
// immediately. Keeping this unconditional costs nothing and covers uploads if the backend queues them.
export function useJobStatus(id: string) {
  return usePollUntil<JobDescription>(["jobs", id], () => jobApi.get(id), (jd) => isJobTerminal(jd.status), 2000);
}
