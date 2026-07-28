import { api } from "@/lib/api/client";
import type { ReferralInfo } from "./referral.types";

export const referralApi = {
  getMe: () => api.get<ReferralInfo>("/referrals/me"),
};
