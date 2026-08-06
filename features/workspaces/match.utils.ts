import type { MatchBandTier } from "@/components/ui/match-band-badge";
import type { MatchCoverage } from "./match.types";

// Real /match response has no band field — classify client-side, mirroring the exact thresholds
// the backend uses for AtsReport.matchBand (confirmed live: low <35%, fair 35-70%, strong 70%+),
// so the pre-analysis preview and the post-analysis report badge always agree.
export function classifyMatchRatio(matched: number, total: number): MatchBandTier {
  const ratio = total > 0 ? matched / total : 1;
  return ratio < 0.35 ? "low" : ratio < 0.7 ? "fair" : "strong";
}

export function classifyMatchCoverage(coverage: MatchCoverage): MatchBandTier {
  return classifyMatchRatio(coverage.requiredMatched, coverage.requiredTotal);
}
