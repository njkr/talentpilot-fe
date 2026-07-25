"use client";

import { useState } from "react";
import { CheckCircleIcon, MinusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { H3, Caption } from "@/components/ui/typography";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { FilterChip } from "@/components/ui/filter-chip";
import type { KeywordMatch, KeywordStatus } from "../report.types";

export function KeywordTable({ keywords }: { keywords: KeywordMatch[] }) {
  const [filter, setFilter] = useState<KeywordStatus | "all">("all");

  const counts = {
    matched: keywords.filter((k) => k.status === "matched").length,
    partial: keywords.filter((k) => k.status === "partial").length,
    missing: keywords.filter((k) => k.status === "missing").length,
  };

  // Missing-and-required first — that's the highest-leverage thing to fix.
  const sorted = [...keywords].sort((a, b) => {
    const rank = (k: KeywordMatch) => (k.status === "missing" ? 0 : k.status === "partial" ? 1 : 2) * 10 + (k.importance === "required" ? 0 : k.importance === "preferred" ? 1 : 2);
    return rank(a) - rank(b);
  });

  const shown = filter === "all" ? sorted : sorted.filter((k) => k.status === filter);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <H3>Keyword coverage</H3>
        <div className="flex gap-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All {keywords.length}
          </FilterChip>
          <FilterChip active={filter === "missing"} onClick={() => setFilter("missing")} tone="danger">
            Missing {counts.missing}
          </FilterChip>
          <FilterChip active={filter === "partial"} onClick={() => setFilter("partial")} tone="warning">
            Partial {counts.partial}
          </FilterChip>
          <FilterChip active={filter === "matched"} onClick={() => setFilter("matched")} tone="success">
            Matched {counts.matched}
          </FilterChip>
        </div>
      </div>

      <div className="divide-y divide-border">
        {shown.map((k) => (
          <KeywordRow key={k.canonical} kw={k} />
        ))}
      </div>
    </Card>
  );
}

function KeywordRow({ kw }: { kw: KeywordMatch }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <KeywordStatusIcon status={kw.status} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{kw.keyword}</span>
          <ImportanceBadge importance={kw.importance} />
        </div>

        {/* Matched -> show WHERE it was found (proof). Missing -> show HOW to add it (action). */}
        {kw.status !== "missing" && kw.foundIn.length > 0 && <Caption className="mt-0.5 block">Found in: {kw.foundIn.join(", ")}</Caption>}
        {kw.status === "missing" && kw.suggestion && <p className="mt-1 text-xs text-ink-secondary">{kw.suggestion}</p>}
      </div>
    </div>
  );
}

function KeywordStatusIcon({ status }: { status: KeywordStatus }) {
  if (status === "matched") return <CheckCircleIcon className="h-5 w-5 shrink-0 text-success" />;
  if (status === "partial") return <MinusCircleIcon className="h-5 w-5 shrink-0 text-warning" />;
  return <XCircleIcon className="h-5 w-5 shrink-0 text-danger" />;
}
