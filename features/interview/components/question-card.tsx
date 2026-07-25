"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Body, Caption } from "@/components/ui/typography";
import { Collapse } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useSubmitAnswer } from "../hooks/use-submit-answer";
import { ScoreMeter } from "./score-meter";
import type { InterviewQuestion } from "../interview.types";

const typeLabels: Record<InterviewQuestion["type"], string> = {
  hr: "HR",
  behavioral: "Behavioral",
  technical: "Technical",
  coding: "Coding",
  system_design: "System design",
};

const difficultyTone: Record<InterviewQuestion["difficulty"], string> = {
  easy: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  hard: "bg-danger/10 text-danger",
};

const scoreTone = (score: number) => (score >= 75 ? "bg-success/10 text-success" : score >= 50 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning");

export function QuestionCard({ question, workspaceId }: { question: InterviewQuestion; workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [showIdeal, setShowIdeal] = useState(false);
  const [answer, setAnswer] = useState(question.userAnswer ?? "");
  const submit = useSubmitAnswer(workspaceId);

  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-bg px-2 py-0.5 text-xs font-medium text-ink-secondary">{typeLabels[question.type]}</span>
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium capitalize", difficultyTone[question.difficulty])}>{question.difficulty}</span>
              {question.framework && <span className="rounded-md bg-bg px-2 py-0.5 text-xs font-medium text-ink-secondary">{question.framework}</span>}
              {question.answerScore != null && <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", scoreTone(question.answerScore))}>Scored {question.answerScore}</span>}
            </div>
            <p className="text-sm font-medium text-ink">{question.question}</p>
          </div>
          <ChevronDownIcon className={cn("h-5 w-5 shrink-0 text-ink-muted transition-transform", open && "rotate-180")} />
        </div>
      </button>

      <Collapse open={open}>
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {/* basedOn is what makes this feel personal — it names the exact resume line. */}
          {question.basedOn && (
            <div className="rounded-lg bg-primary/[0.04] px-3 py-2">
              <Caption className="mb-0.5 block">Based on your resume</Caption>
              <p className="text-xs text-ink-secondary italic">&quot;{question.basedOn}&quot;</p>
            </div>
          )}

          <div>
            <Caption className="mb-1 block">What the interviewer is testing</Caption>
            <Body>{question.whyAsked}</Body>
          </div>

          {/* Practice mode */}
          <div>
            <Caption className="mb-1.5 block">Your answer</Caption>
            <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={question.framework === "STAR" ? "Situation, Task, Action, Result…" : "Type your answer to get feedback…"} />
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" loading={submit.isPending} disabled={answer.trim().length < 20} onClick={() => submit.mutate({ questionId: question.id, answer })}>
                Get feedback — 1 credit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowIdeal(!showIdeal)}>
                {showIdeal ? "Hide" : "Show"} model answer
              </Button>
            </div>
          </div>

          {/* Feedback — a coach, not a pass/fail gate. */}
          {question.aiFeedback && (
            <div className="rounded-lg border border-border bg-bg/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <Caption>Feedback</Caption>
                {question.answerScore != null && <ScoreMeter score={question.answerScore} />}
              </div>
              <Body>{question.aiFeedback}</Body>
            </div>
          )}

          {showIdeal && (
            <div className="rounded-lg bg-success/[0.04] p-3">
              <Caption className="mb-1 block text-success">Model answer</Caption>
              <Body>{question.idealAnswer}</Body>
            </div>
          )}
        </div>
      </Collapse>
    </Card>
  );
}
