"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChip } from "@/components/ui/filter-chip";
import { Body } from "@/components/ui/typography";
import { useInterviewQuestions } from "../hooks/use-interview-questions";
import { QuestionCard } from "./question-card";
import type { InterviewQuestion } from "../interview.types";

const typeLabels: Record<InterviewQuestion["type"], string> = {
  hr: "HR",
  behavioral: "Behavioral",
  technical: "Technical",
  coding: "Coding",
  system_design: "System design",
};

export function InterviewTab({ workspaceId, active }: { workspaceId: string; active: boolean }) {
  const { data: questions, isLoading } = useInterviewQuestions(workspaceId, active);
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!questions?.length) return <EmptyState title="No questions yet" />;

  const types = [...new Set(questions.map((q) => q.type))];
  const shown = filter === "all" ? questions : questions.filter((q) => q.type === filter);
  const answered = questions.filter((q) => q.answerScore != null).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Body>
          {questions.length} questions · {answered} practiced
        </Body>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {types.map((t) => (
            <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>
              {typeLabels[t]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {shown.map((q) => (
          <QuestionCard key={q.id} question={q} workspaceId={workspaceId} />
        ))}
      </div>
    </div>
  );
}
