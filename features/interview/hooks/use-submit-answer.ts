"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUiStore } from "@/stores/ui.store";
import { ApiError } from "@/lib/api/error";
import { interviewApi } from "../interview.api";

export function useSubmitAnswer(workspaceId: string) {
  const qc = useQueryClient();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);

  return useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) => interviewApi.submitAnswer(questionId, answer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "interview"] });
      qc.invalidateQueries({ queryKey: ["credits"] }); // 1 credit spent
    },
    onError: (err) => {
      // Same charge-on-success ordering as the cover letter — a failed feedback call costs
      // nothing, so no "you were charged" messaging is needed for a non-credits failure here.
      if (err instanceof ApiError && err.code === "INSUFFICIENT_CREDITS") {
        openUpgradeModal(err.details);
      }
    },
  });
}
