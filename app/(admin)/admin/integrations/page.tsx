import type { Metadata } from "next";
import { IntegrationsDashboard } from "@/features/admin/components/integrations-dashboard";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return <IntegrationsDashboard />;
}
