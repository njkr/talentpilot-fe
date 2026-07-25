"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { securityApi } from "../security.api";

export function useSessions() {
  return useQuery({ queryKey: ["sessions"], queryFn: securityApi.listSessions });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (familyId: string) => securityApi.revokeSession(familyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast("Device signed out", "success");
    },
  });
}
