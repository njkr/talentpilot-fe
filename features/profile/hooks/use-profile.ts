"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { profileApi } from "../profile.api";
import type { ProfileUpdate } from "../profile.types";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: profileApi.get });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileUpdate) => profileApi.update(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast("Profile saved", "success");
    },
  });
}
