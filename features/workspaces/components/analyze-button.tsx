"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Body, Caption } from "@/components/ui/typography";
import { useCredits } from "@/features/credits/credits.hooks";
import { useUiStore } from "@/stores/ui.store";
import { ApiError } from "@/lib/api/error";
import { useAnalyze } from "../hooks/use-analyze";
import { useCheckMatch } from "../hooks/use-check-match";
import { classifyMatchCoverage } from "../match.utils";
import type { MatchCoverage } from "../match.types";
import * as crypto from "crypto";

export const ANALYZE_COST = 21;

export function AnalyzeButton({
  workspaceId,
  resumeId,
  jobDescriptionId,
  size = "lg",
}: {
  workspaceId: string;
  resumeId: string;
  jobDescriptionId: string;
  size?: "sm" | "lg";
}) {
  const { data: credits } = useCredits();
  const analyze = useAnalyze(workspaceId);
  const checkMatch = useCheckMatch();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const router = useRouter();

  const [matchWarning, setMatchWarning] = useState<MatchCoverage | null>(null);

  const runAnalyze = () => {
    // ONE fresh UUID per click — this is the idempotency key. A double-click or a flaky-network
    // retry of the same click reuses it and returns the SAME run instead of starting a second
    // (and re-charging 21). Do NOT generate a new key on retry of the same logical action.
    analyze.mutate(globalThis.crypto.randomUUID(), {
      onError: (err) => {
        setMatchWarning(null);
        if (!(err instanceof ApiError)) return;
        if (err.code === "INSUFFICIENT_CREDITS") {
          openUpgradeModal(err.details);
          return;
        }
        // Another run is already active for this workspace -> jump to it instead of erroring.
        if (err.code === "ANALYSIS_ALREADY_RUNNING") {
          const runId = err.details?.runId as string | undefined;
          if (runId) router.push(`/workspaces/${workspaceId}?run=${runId}`);
        }
      },
    });
  };

  const onClick = () => {
    // Pre-check credits so the user gets the upgrade modal BEFORE a failed request, not after.
    // No reason to call /match at all if the user can't afford analysis regardless.
    if ((credits?.balance ?? 0) < ANALYZE_COST) {
      openUpgradeModal({
        required: ANALYZE_COST,
        balance: credits?.balance ?? 0,
      });
      return;
    }

    // /match is a soft, advisory pre-check (not credit-gated) — any failure here falls straight
    // through to the real analyze flow rather than blocking the one action that actually matters.
    checkMatch.mutate(
      { resumeId, jobDescriptionId },
      {
        onSuccess: (result) => {
          if (result.coverage.requiredTotal > 0 && classifyMatchCoverage(result.coverage) === "low") {
            setMatchWarning(result.coverage);
            return;
          }
          runAnalyze();
        },
        onError: () => runAnalyze(),
      },
    );
  };

  return (
    <>
      <Button onClick={onClick} loading={checkMatch.isPending || analyze.isPending} size={size}>
        Analyze — {ANALYZE_COST} credits
      </Button>

      <Modal open={!!matchWarning} onClose={() => setMatchWarning(null)} title="Low keyword match">
        {matchWarning && (
          <div className="space-y-4">
            <Body>
              This role needs {matchWarning.missingRequiredKeywords.join(", ")}, which {matchWarning.missingRequiredKeywords.length === 1 ? "isn't" : "aren't"} on your resume — analyze
              anyway?
            </Body>
            <Caption className="block">
              You meet {matchWarning.requiredMatched} of {matchWarning.requiredTotal} required skills.
            </Caption>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setMatchWarning(null)}>
                Cancel
              </Button>
              <Button variant="primary" loading={analyze.isPending} onClick={runAnalyze}>
                Analyze anyway — {ANALYZE_COST} credits
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
