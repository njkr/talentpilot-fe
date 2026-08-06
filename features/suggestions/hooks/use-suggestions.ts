"use client";

import { useQuery } from "@tanstack/react-query";
import { suggestionApi } from "../suggestion.api";

export function useSuggestions(workspaceId: string, active: boolean) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "suggestions"],
    queryFn: () => suggestionApi.list(workspaceId),
    enabled: active,
  });
}
