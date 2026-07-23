// Confirmed live 2026-07-23 by creating real workspaces and running the full pipeline.
export type WorkspaceStatus = "created" | "queued" | "processing" | "completed" | "partial" | "failed";

export interface Workspace {
  id: string;
  name: string;
  resumeId: string;
  jobDescriptionId: string;
  status: WorkspaceStatus;
  lastRunId: string | null;
  analyzedResumeVersion: number | null;
  createdAt: string;
}

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

// The 12 real step names, confirmed live (all seen in an actual run's steps array).
export type StepName =
  | "parse_resume"
  | "parse_jd"
  | "generate_embeddings"
  | "match_keywords"
  | "score_ats"
  | "optimize_resume"
  | "generate_cover_letter"
  | "build_learning_path"
  | "generate_interview_qs"
  | "research_company"
  | "estimate_salary"
  | "finalize";

export interface RunStep {
  name: string;
  status: StepStatus;
  error: string | null;
  // Only ever populated from a live SSE step.started event (label isn't in the poll/GET shape) —
  // absent until we've seen this step start at least once this session.
  label?: string;
}

export type RunStatus = "queued" | "running" | "completed" | "partial" | "failed";

// Full shape — confirmed live via GET /workspaces/runs/:runId AND the retry response (same shape).
export interface RunState {
  id: string;
  workspaceId: string;
  status: RunStatus;
  progress: number;
  currentStep: string | null;
  creditsCharged: number;
  creditsRefunded: number;
  error: string | null;
  steps: RunStep[];
}

export const isRunTerminal = (s: RunStatus) => s === "completed" || s === "failed" || s === "partial";
