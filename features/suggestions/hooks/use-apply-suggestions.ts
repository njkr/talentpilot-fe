"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { suggestionApi } from "../suggestion.api";

export function useApplySuggestions(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionIds: string[]) => suggestionApi.apply(workspaceId, suggestionIds),

    onSuccess: (res) => {
      // A batch of accepted suggestions becomes ONE new version (confirmed live) — not one per suggestion.
      qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "suggestions"] });
      qc.invalidateQueries({ queryKey: ["resumes"] }); // currentVersion changed

      if (res.applied > 0) {
        toast(`Version ${res.version} created — ${res.applied} improvement${res.applied === 1 ? "" : "s"} applied`, "success");
      }

      // `skipped` = suggestions refused because the user hand-edited that bullet after the
      // suggestion was generated (the backend's staleness hash check). Explain it — silently
      // dropping them would look like a bug.
      if (res.skipped.length > 0) {
        toast(`${res.skipped.length} suggestion${res.skipped.length === 1 ? " was" : "s were"} skipped — you edited that text after the suggestion was created, so we didn't overwrite your changes.`, "warning");
      }
    },
  });
}
