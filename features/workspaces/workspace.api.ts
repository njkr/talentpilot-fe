import { api } from "@/lib/api/client";
import type { Workspace, RunState } from "./workspace.types";

export const workspaceApi = {
  create: (body: { resumeId: string; jobDescriptionId: string; name: string }) => api.post<Workspace>("/workspaces", body),
  list: (cursor?: string) => api.list<Workspace[]>("/workspaces", cursor ? { cursor } : undefined),
  get: (id: string) => api.get<Workspace>(`/workspaces/${id}`),
  remove: (id: string) => api.del<void>(`/workspaces/${id}`),

  // Confirmed live: no Idempotency-Key required, response is { runId, status, creditsCharged, replayed }.
  analyze: (id: string, idempotencyKey: string) => api.postIdempotent<{ runId: string; status: string; creditsCharged: number; replayed: boolean }>(`/workspaces/${id}/analyze`, {}, idempotencyKey),

  getRun: (runId: string) => api.get<RunState>(`/workspaces/runs/${runId}`),
  streamTicket: (runId: string) => api.post<{ ticket: string; expiresInSec: number }>(`/workspaces/runs/${runId}/stream-ticket`),
  // Retry does NOT need an Idempotency-Key (confirmed live) — it re-queues the same run.
  retryRun: (runId: string) => api.post<RunState>(`/workspaces/runs/${runId}/retry`),
};
