import type { Metadata } from "next";
import { PlanManagement } from "@/features/admin/components/plan-management";

export const metadata: Metadata = { title: "Plans" };

export default function PlansPage() {
  return <PlanManagement />;
}
