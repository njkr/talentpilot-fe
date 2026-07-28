import type { Metadata } from "next";
import { PaymentConfigForm } from "@/features/admin/components/payment-config-form";

export const metadata: Metadata = { title: "Payment configuration" };

export default function PaymentConfigPage() {
  return <PaymentConfigForm />;
}
