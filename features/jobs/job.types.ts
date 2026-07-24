// Confirmed live 2026-07-22 (paste path) + the API doc's captured §2.10 response — both agree
// exactly. The upload path's status values are NOT confirmed (never observed live); 'analyzing'
// is carried over from the sprint doc as a placeholder since upload "uses the same extraction
// pipeline as resumes" per the doc, but update this the first time an upload is actually seen.
export type JobStatus = "analyzing" | "analyzed" | "failed";
export type Importance = "required" | "preferred" | "nice_to_have";

export interface JobRequirement {
  text: string;
  category: string;
  importance: Importance;
}
export interface JobSkill {
  name: string;
  category: string;
  importance: Importance;
}

export interface JobParsedData {
  position: string;
  company: string | null;
  seniority: string | null; // "unknown" (literal string, not null) when nothing recognized
  remoteType: string | null; // "unknown" (literal string) when nothing recognized
  employmentType: string | null;
  location: string | null;
  experienceRequired: string | null;
  requirements: JobRequirement[];
  skills: JobSkill[];
  keywords: string[];
  responsibilities: string[];
  salary: { min: number | null; max: number | null; currency: string | null };
}

export type MissingField = "company" | "position";

// Real top-level shape has several fields the sprint doc's guess omitted entirely (employmentType,
// location, salaryMin/Max/Currency all duplicated at this level, not just inside parsedData).
// missingFields confirmed live 2026-07-24 (see the FE integration guide for the feature) —
// populated once status is 'analyzed'; meaningless (may be absent or stale) before that.
export interface JobDescription {
  id: string;
  company: string | null;
  position: string | null; // backend defaults this to the literal string "Untitled position" when
  // unresolved — NEVER actually null. Use displayPosition() below, not `position ?? fallback`,
  // which never fires since the value is always a truthy string.
  source: "paste" | "upload";
  status: JobStatus;
  employmentType: string | null;
  location: string | null;
  remoteType: string | null;
  experienceRequired: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  parsedData: JobParsedData | null;
  parseError: string | null;
  missingFields: MissingField[];
  createdAt: string;
}

export const isJobTerminal = (s: JobStatus) => s === "analyzed" || s === "failed";

const UNSET_POSITION_SENTINEL = "Untitled position";

// The backend's "position not resolved" sentinel is a real, non-null string — a naive
// `position ?? fallback` never catches it. Checked directly against the literal value (not just
// missingFields) so it's correct even outside 'analyzed' status, where missingFields isn't
// guaranteed meaningful.
export const displayPosition = (jd: Pick<JobDescription, "position">): string => (jd.position && jd.position !== UNSET_POSITION_SENTINEL ? jd.position : "Untitled role");
