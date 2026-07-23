import type { Importance } from "@/features/jobs/job.types";

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
}
