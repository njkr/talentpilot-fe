"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import { ImpactBadge } from "@/components/ui/impact-badge";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/error";
import { useProvideDetail } from "../hooks/use-provide-detail";
import { useRejectSuggestions } from "../hooks/use-reject-suggestions";
import type { AiSuggestion } from "../suggestion.types";

// Modeled on features/jobs/components/missing-fields-banner.tsx's structural pieces (controlled
// input + disabled-until-non-empty + mutation loading), diverging where this differs:
// - Skip is a real reject() call, not a purely local dismiss.
// - A resubmission can genuinely stay needs_info (refreshed missingFact/exampleValue) — shown as
//   an inline retry message, not a toast, since it's an expected real outcome, not an error.
export function NeedsInfoCard({ suggestion, workspaceId, resumeId }: { suggestion: AiSuggestion; workspaceId: string; resumeId: string }) {
  const [draft, setDraft] = useState("");
  const [attempted, setAttempted] = useState(false);
  const qc = useQueryClient();
  const provideDetail = useProvideDetail(workspaceId);
  const reject = useRejectSuggestions(workspaceId);

  const submit = () => {
    const newText = draft.trim();
    if (!newText) return;
    setAttempted(true);
    provideDetail.mutate(
      { suggestionId: suggestion.id, newText },
      {
        onSuccess: () => setDraft(""),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 404) {
            toast(err.message, "error");
            qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "suggestions"] });
          }
        },
      },
    );
  };

  return (
    <Card className="border-warning/30 bg-warning/5">
      <div className="flex items-start gap-3">
        <QuestionMarkCircleIcon className="h-5 w-5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ImpactBadge impact={suggestion.impact} />
            <Caption className="capitalize">{suggestion.sectionType}</Caption>
          </div>

          {suggestion.needsDirectEdit ? (
            // provide-detail can NEVER resolve this case — it checks the resubmitted text against
            // the resume's frozen original text, which can never contain a skill added after
            // upload. missingFact is already a complete, standalone sentence here — render it as
            // given rather than wrapping it in the "We couldn't verify..." template below, which
            // would double up ("verify Unity isn't evidenced... from your resume").
            <>
              <p className="text-sm text-ink">{suggestion.missingFact}</p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/resumes/${resumeId}`}>Edit resume</Link>
                </Button>
                <Button size="sm" variant="ghost" loading={reject.isPending} onClick={() => reject.mutate([suggestion.id])}>
                  Skip
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-ink">We couldn&apos;t verify {suggestion.missingFact ?? "a detail this suggestion needs"} from your resume.</p>
                {attempted && (
                  <Caption className="mt-1 block text-warning">Still couldn&apos;t verify that — here&apos;s an updated example.</Caption>
                )}
              </div>

              <div className="rounded-lg bg-card px-3 py-2">
                <Caption className="mb-1 block">
                  e.g. &ldquo;{suggestion.newText}&rdquo;{suggestion.exampleValue ? ` (${suggestion.exampleValue})` : ""} — not from your resume, edit before using.
                </Caption>
              </div>

              <div className="space-y-2">
                <Textarea placeholder={suggestion.newText} value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={submit} loading={provideDetail.isPending} disabled={!draft.trim()}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" loading={reject.isPending} onClick={() => reject.mutate([suggestion.id])}>
                    Skip
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
