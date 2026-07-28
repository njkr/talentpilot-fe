import type { Metadata } from "next";
import { ReferralOversight } from "@/features/admin/components/referral-oversight";

export const metadata: Metadata = { title: "Referrals" };

export default function AdminReferralsPage() {
  return <ReferralOversight />;
}
