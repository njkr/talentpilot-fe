"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suggestionApi } from "../suggestion.api";

export function useProvideDetail(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ suggestionId, newText }: { suggestionId: string; newText: string }) => suggestionApi.provideDetail(workspaceId, suggestionId, newText),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspaces", workspaceId, "suggestions"] }),
  });
}
