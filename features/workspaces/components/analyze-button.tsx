"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/features/credits/credits.hooks";
import { useUiStore } from "@/stores/ui.store";
import { ApiError } from "@/lib/api/error";
import { useAnalyze } from "../hooks/use-analyze";

const ANALYZE_COST = 21;

export function AnalyzeButton({ workspaceId }: { workspaceId: string }) {
  const { data: credits } = useCredits();
  const analyze = useAnalyze(workspaceId);
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);
  const router = useRouter();

  const onClick = () => {
    // Pre-check credits so the user gets the upgrade modal BEFORE a failed request, not after.
    if ((credits?.balance ?? 0) < ANALYZE_COST) {
      openUpgradeModal({ required: ANALYZE_COST, balance: credits?.balance ?? 0 });
      return;
    }

    // ONE fresh UUID per click — this is the idempotency key. A double-click or a flaky-network
    // retry of the same click reuses it and returns the SAME run instead of starting a second
    // (and re-charging 21). Do NOT generate a new key on retry of the same logical action.
    analyze.mutate(crypto.randomUUID(), {
      onError: (err) => {
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

  return (
    <Button onClick={onClick} loading={analyze.isPending} size="lg">
      Analyze — {ANALYZE_COST} credits
    </Button>
  );
}
