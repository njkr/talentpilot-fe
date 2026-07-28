import type { Metadata } from "next";
import { CostDashboard } from "@/features/admin/components/cost-dashboard";

export const metadata: Metadata = { title: "AI costs" };

export default function CostsPage() {
  return <CostDashboard />;
}
