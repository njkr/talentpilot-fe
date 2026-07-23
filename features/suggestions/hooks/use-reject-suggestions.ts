"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suggestionApi } from "../suggestion.api";

export function useRejectSuggestions(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (suggestionIds: string[]) => suggestionApi.reject(workspaceId, suggestionIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "suggestions"] }),
  });
}
