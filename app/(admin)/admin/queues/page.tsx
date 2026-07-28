import type { Metadata } from "next";
import { DeadLetterQueue } from "@/features/admin/components/dead-letter-queue";

export const metadata: Metadata = { title: "Dead-letter queue" };

export default function QueuesPage() {
  return <DeadLetterQueue />;
}
