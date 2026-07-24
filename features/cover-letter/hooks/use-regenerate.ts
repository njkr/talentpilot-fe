"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { useUiStore } from "@/stores/ui.store";
import { ApiError } from "@/lib/api/error";
import { coverLetterApi } from "../cover-letter.api";
import type { RegenerateCoverLetterBody } from "../cover-letter.types";

export function useRegenerateCoverLetter(workspaceId: string) {
  const qc = useQueryClient();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);

  return useMutation({
    mutationFn: (body: RegenerateCoverLetterBody) => coverLetterApi.regenerate(workspaceId, body),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "cover-letter"] });
      qc.invalidateQueries({ queryKey: ["credits"] }); // 2 credits spent -> update topbar
      toast("Cover letter regenerated", "success");
    },

    onError: (err) => {
      if (!(err instanceof ApiError)) return;
      if (err.code === "INSUFFICIENT_CREDITS") {
        openUpgradeModal(err.details);
        return;
      }
      // The backend's placeholder guard can reject a generation (confirmed live: 3/3 real
      // attempts in this account hit it, real code AI_OUTPUT_INVALID — NOT INVALID_OUTPUT or
      // AI_INVALID_OUTPUT, both plausible-looking guesses that don't exist). Credits are charged
      // ONLY on success (confirmed live: balance was unchanged after a rejected generation), so
      // say that — otherwise the user assumes they just paid for a failure.
      if (err.code === "AI_OUTPUT_INVALID") {
        toast("That draft didn't pass our quality check. Try again — you weren't charged.", "warning");
      }
    },
  });
}
