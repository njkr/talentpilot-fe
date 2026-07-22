"use client";

import { useEffect, useState } from "react";
import { usePollUntil } from "@/hooks/use-poll-until";
import { resumeApi } from "../resume.api";
import { isTerminal, type Resume } from "../resume.types";

const STUCK_AFTER_MS = 30_000;

/**
 * Polls one resume until it reaches `parsed` or `failed`, then stops.
 * `stuck` flags the "worker probably down" case: if it's still sitting at `uploaded` or
 * `extracted` (a queue-wait point, not active processing) 30s past its own createdAt, that's an
 * ops problem worth a distinct message, not an infinite spinner.
 *
 * Measured against the resume's own createdAt (server truth), via a timer scheduled in an effect
 * rather than a direct Date.now() comparison during render (React's purity rule forbids calling
 * impure functions in the render body). The timer only ever calls setState from inside its own
 * callback, never synchronously in the effect body. Comparing a "stuck key" (id+status) against
 * the current one, rather than a plain boolean, means a status change automatically invalidates a
 * stale stuck flag with no separate reset call needed.
 */
export function useResumeStatus(id: string, enabled = true) {
  const query = usePollUntil<Resume>(["resumes", id], () => resumeApi.get(id), (r) => isTerminal(r.status), 2000, enabled);
  const data = query.data;
  const inQueueWait = !!data && (data.status === "uploaded" || data.status === "extracted");
  const currentKey = data ? `${data.id}:${data.status}` : null;

  const [stuckKey, setStuckKey] = useState<string | null>(null);

  useEffect(() => {
    if (!inQueueWait || !data) return;
    const elapsed = Date.now() - new Date(data.createdAt).getTime();
    const delay = Math.max(STUCK_AFTER_MS - elapsed, 0);
    const key = `${data.id}:${data.status}`;
    const timer = setTimeout(() => setStuckKey(key), delay);
    return () => clearTimeout(timer);
  }, [inQueueWait, data]);

  const stuck = inQueueWait && stuckKey === currentKey;

  return { ...query, stuck };
}
