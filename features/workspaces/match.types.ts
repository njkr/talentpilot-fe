import type { Importance } from "@/features/jobs/job.types";

// Confirmed live via POST /resumes/:resumeId/match/:jdId (201 Created, not credit-gated). Full
// real response shape — only `coverage` is currently consumed, but typed in full per this
// codebase's convention of typing the real response, not just the fields actively rendered.
export interface MatchPerRequirement {
  requirement: string;
  importance: Importance;
  rawSimilarity: number;
  score: number;
  evidence: string | null;
  foundIn: string; // only "Summary" observed live — kept as string, not narrowed to a union
  verdict: string; // only "partial" observed live — kept as string, not narrowed to a union
}

export interface MatchKeyword {
  keyword: string;
  canonical: string;
  category: string;
  importance: Importance;
  status: string; // don't assume this is identical to the report's KeywordStatus set
  foundIn: string[];
  source: string; // "exact" | "ai" observed live
}

export interface MatchStats {
  resume: { embedded: number; reused: number };
  jd: { embedded: number; reused: number };
}

export interface MatchCoverage {
  requiredTotal: number;
  requiredMatched: number;
  requiredMissing: number;
  preferredTotal: number;
  preferredMatched: number;
  missingRequiredKeywords: string[];
}

export interface MatchResult {
  semanticScore: number;
  perRequirement: MatchPerRequirement[];
  keywords: MatchKeyword[];
  stats: MatchStats;
  coverage: MatchCoverage;
}
