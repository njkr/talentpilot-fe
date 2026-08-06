import type { Importance } from "@/features/jobs/job.types";
import type { MatchBandTier } from "@/components/ui/match-band-badge";

// Confirmed live 2026-07-23 against a real ATS report (a run whose scoring steps completed even
// though the overall run status stayed 'failed' on a later step — the report only depends on
// score_ats/match_keywords having completed, not the whole run reaching 'completed').
export interface ScoreComponent {
  component: string; // 'keyword' | 'semantic' | 'experience' | 'education' | 'project' | 'format' | 'grammar'
  score: number; // 0-100
  weight: number; // e.g. 0.30
  contribution: number; // score * weight (renormalised if a component is excluded)
}

export type KeywordStatus = "matched" | "partial" | "missing";

// Computed server-side from the same `keywords` array already on the report (no new fetch). low
// below 35% of required keywords matched, fair 35-70%, strong 70%+ (or trivially strong when the
// JD has zero required keywords). Reframes the bare score as "you meet N of M required skills" —
// a materially more honest fit signal than a numeric grade alone.
export interface MatchBand {
  band: MatchBandTier;
  requiredMet: number;
  requiredTotal: number;
}

export interface KeywordMatch {
  keyword: string;
  canonical: string;
  category: string;
  importance: Importance;
  status: KeywordStatus;
  evidence: string | null; // never observed populated live — always null so far
  foundIn: string[]; // real section/role names for matched keywords, confirmed live
  suggestion: string | null; // real, specific templated text for missing keywords, confirmed live
}

export interface AtsReport {
  id: string;
  workspaceId: string;
  runId: string;
  resumeVersion: number;
  overallScore: number;
  keywordScore: number;
  semanticScore: number;
  experienceScore: number;
  educationScore: number | null; // NULLABLE — absent when the JD has no education requirement
  projectScore: number;
  formatScore: number;
  grammarScore: number;
  scoreBreakdown: ScoreComponent[]; // render THIS array, not the flat fields above
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywords: KeywordMatch[];
  createdAt: string;
  // The very first report ever generated for this workspace — null until a rescore has run.
  // Confirmed live: a full nested AtsReport, not a thin stub, EXCEPT its own `keywords` is
  // always [] by design (don't build a keyword table off it) and its own nested `original` is
  // always null (no infinite chaining).
  original: AtsReport | null;
  // null only on the nested `original` report above (which already carries no keywords either).
  matchBand: MatchBand | null;
}
