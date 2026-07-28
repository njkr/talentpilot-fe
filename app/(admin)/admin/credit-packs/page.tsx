import type { Metadata } from "next";
import { CreditPackManagement } from "@/features/admin/components/credit-pack-management";

export const metadata: Metadata = { title: "Credit packs" };

export default function CreditPacksPage() {
  return <CreditPackManagement />;
}
