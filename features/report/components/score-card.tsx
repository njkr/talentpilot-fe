"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { H3, Body } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { AtsReport } from "../report.types";

export function ScoreCard({ report }: { report: AtsReport }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <ScoreRing score={report.overallScore} />
        <div className="flex-1">
          <H3>ATS compatibility</H3>
          <Body className="mt-1">{report.summary}</Body>
        </div>
      </div>
    </Card>
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
