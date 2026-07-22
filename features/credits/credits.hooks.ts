"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Real shape confirmed live: { balance: number }.
export function useCredits() {
  return useQuery({ queryKey: ["credits"], queryFn: () => api.get<{ balance: number }>("/credits") });
}
