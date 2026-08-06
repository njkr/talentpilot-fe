"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { H3, Body, Caption } from "@/components/ui/typography";
import { MatchBandBadge } from "@/components/ui/match-band-badge";
import { cn } from "@/lib/utils";
import type { AtsReport } from "../report.types";

export function ScoreCard({ report, actions }: { report: AtsReport; actions?: ReactNode }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <ScoreRing score={report.overallScore} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <H3>ATS compatibility</H3>
                {report.matchBand && <MatchBandBadge band={report.matchBand.band} />}
              </div>
              {/* Never hardcode/imply a target improvement — the number is genuinely
                  recalculated and may not move at all. */}
              {report.original && <ScoreDelta current={report.overallScore} original={report.original.overallScore} />}
              {/* Reframes the bare score as a fit signal for THIS job, not a grade on the resume
                  — deliberately not softened for a "low" band. */}
              {report.matchBand && (
                <Caption className="mt-1 block">
                  You meet {report.matchBand.requiredMet} of {report.matchBand.requiredTotal} required skills
                </Caption>
              )}
            </div>
            {actions}
          </div>
          <Body className="mt-1">{report.summary}</Body>
        </div>
      </div>
    </Card>
  );
}

function ScoreDelta({ current, original }: { current: number; original: number }) {
  const delta = current - original;
  const tone = delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-ink-secondary";
  const sign = delta > 0 ? "+" : delta < 0 ? "" : "±";
  return (
    <div className="mt-0.5 flex items-center gap-1.5">
      <span className={cn("text-xs font-semibold", tone)}>{sign}{delta}</span>
      <Caption>Was {original}</Caption>
    </div>
  );
}

// A ring, not a giant number on a gradient — the calm treatment the design doc asks for.
function ScoreRing({ score }: { score: number }) {
  const tone = score >= 80 ? "text-success" : score >= 60 ? "text-primary" : "text-warning";
  const circumference = 2 * Math.PI * 44;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" strokeWidth="8" className="stroke-border" />
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={cn("stroke-current", tone)}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${(score / 100) * circumference} ${circumference}` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className={cn("text-3xl font-bold", tone)}>{score}</span>
      </div>
    </div>
  );
}
