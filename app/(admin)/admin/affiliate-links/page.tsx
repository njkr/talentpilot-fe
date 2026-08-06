import type { Metadata } from "next";
import { AffiliateLinkManagement } from "@/features/admin/components/affiliate-link-management";

export const metadata: Metadata = { title: "Affiliate links" };

export default function AffiliateLinksPage() {
  return <AffiliateLinkManagement />;
}
