"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboard.api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
    // The server caches 30s; mirror that client-side so navigating away and back doesn't refetch.
    staleTime: 30_000,
    refetchOnWindowFocus: true, // returning to the tab should show fresh counts
  });
}
