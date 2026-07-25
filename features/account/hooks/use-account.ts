"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth.store";
import { accountApi } from "../account.api";

export function useExportData() {
  return useMutation({
    mutationFn: accountApi.exportData,
    onSuccess: () => toast("Export queued — you'll get a notification when it's ready", "success"),
  });
}

export function useDeleteAccount() {
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: accountApi.deleteAccount,
    onSuccess: () => {
      clear();
      window.location.href = "/login?accountDeleted=1";
    },
  });
}
