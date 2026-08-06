"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { H3, Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { ScoreComponent } from "../report.types";

const LABELS: Record<string, string> = {
  keyword: "Keyword coverage",
  semantic: "Semantic match",
  experience: "Experience fit",
  education: "Education",
  project: "Projects",
  format: "Formatting",
  grammar: "Grammar & tone",
};

export function ScoreBreakdown({ breakdown, overallScore, originalBreakdown }: { breakdown: ScoreComponent[]; overallScore: number; originalBreakdown?: ScoreComponent[] }) {
  return (
    <Card>
      <H3 className="mb-1">How this score was calculated</H3>
      <Body className="mb-4">Each component is scored independently, then weighted. The total is arithmetic — not an AI opinion.</Body>

      <div className="space-y-3">
        {/* MAP THE ARRAY. Components absent from it were not applicable to this job (e.g.
            education when the posting states no education requirement) and are correctly
            excluded from the weighting — confirmed live: a real report had exactly 6 components,
            no education row, and the remaining weights summed to 1.0 on their own. */}
        {breakdown.map((c) => {
          // originalBreakdown is only present once a rescore has run — and a component present
          // now may not have existed in the very first report (or vice versa), so this is a
          // best-effort lookup, not a guaranteed pairing.
          const original = originalBreakdown?.find((o) => o.component === c.component);
          const delta = original ? c.score - original.score : null;
          return (
            <div key={c.component}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink">{LABELS[c.component] ?? c.component}</span>
                <span className="text-ink-secondary">
                  {c.score}
                  {delta !== null && delta !== 0 && (
                    <span className={cn("ml-1 font-medium", delta > 0 ? "text-success" : "text-danger")}>
                      ({delta > 0 ? "+" : ""}
                      {delta})
                    </span>
                  )}
                  <span className="text-ink-muted"> × {Math.round(c.weight * 100)}% = </span>
                  <span className="font-medium text-ink">{c.contribution.toFixed(1)}</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
                <motion.div className={cn("h-full", barTone(c.score))} initial={{ width: 0 }} animate={{ width: `${c.score}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-medium">
        <span className="text-ink">Total</span>
        <span className="text-ink">{overallScore}</span>
      </div>

      {/* If a component the user might expect is missing, explain WHY — silence looks like a bug. */}
      {!breakdown.some((c) => c.component === "education") && <Caption className="mt-3 block">Education wasn&apos;t scored because this job posting doesn&apos;t state an education requirement. The remaining components were reweighted.</Caption>}
    </Card>
  );
}

const barTone = (s: number) => (s >= 80 ? "bg-success" : s >= 60 ? "bg-primary" : s >= 40 ? "bg-warning" : "bg-danger");
