import type { StepName } from "./workspace.types";

interface StepMeta {
  label: string;
  group: "core" | "parallel";
}

// Canonical display order for all 12 steps. The backend does NOT pre-populate a run's steps
// array with all 12 as "pending" placeholders — it grows the array as each step actually starts
// (confirmed live: a fresh run's first snapshot had only 3-5 entries). Rendering against this
// fixed list (falling back to 'pending' for a name not yet in run.steps) is what keeps the
// timeline's layout stable instead of rows appearing/jumping around as the run progresses.
export const STEP_ORDER: StepName[] = [
  "parse_resume",
  "parse_jd",
  "generate_embeddings",
  "match_keywords",
  "score_ats",
  "optimize_resume",
  "generate_cover_letter",
  "build_learning_path",
  "generate_interview_qs",
  "research_company",
  "estimate_salary",
  "finalize",
];

// Default labels — used until (or unless) a live SSE step.started event gives us the backend's
// own copy for that step this session (see RunStep.label in workspace.types.ts). Labels marked
// "confirmed live" are verbatim from a real step.started event; the rest are reasonable defaults
// since those specific steps were never observed starting (parse_resume/parse_jd are skipped
// whenever the resume/JD are already parsed/analyzed, which is always, by definition, for a
// workspace this app lets you create).
export const STEP_META: Record<StepName, StepMeta> = {
  parse_resume: { label: "Reading your resume", group: "core" },
  parse_jd: { label: "Reading the job description", group: "core" },
  generate_embeddings: { label: "Analyzing semantics", group: "core" },
  match_keywords: { label: "Matching your experience against the requirements", group: "core" }, // confirmed live
  score_ats: { label: "Scoring against ATS criteria", group: "core" }, // confirmed live
  optimize_resume: { label: "Writing improvement suggestions", group: "core" }, // confirmed live
  generate_cover_letter: { label: "Drafting your cover letter", group: "core" }, // confirmed live
  build_learning_path: { label: "Building your learning roadmap", group: "core" }, // confirmed live
  generate_interview_qs: { label: "Preparing interview questions", group: "parallel" },
  research_company: { label: "Researching the company", group: "parallel" }, // confirmed live
  estimate_salary: { label: "Estimating salary range", group: "parallel" }, // confirmed live
  finalize: { label: "Finishing up", group: "core" },
};
