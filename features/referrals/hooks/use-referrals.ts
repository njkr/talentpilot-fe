"use client";

import { useQuery } from "@tanstack/react-query";
import { referralApi } from "../referral.api";

export function useReferralInfo() {
  return useQuery({ queryKey: ["referral"], queryFn: referralApi.getMe });
}
