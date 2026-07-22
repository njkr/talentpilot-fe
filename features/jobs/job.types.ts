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

// Real top-level shape has several fields the sprint doc's guess omitted entirely (employmentType,
// location, salaryMin/Max/Currency all duplicated at this level, not just inside parsedData).
export interface JobDescription {
  id: string;
  company: string | null;
  position: string | null; // backend already defaults this to "Untitled position" when unresolved
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
  createdAt: string;
}

export const isJobTerminal = (s: JobStatus) => s === "analyzed" || s === "failed";
