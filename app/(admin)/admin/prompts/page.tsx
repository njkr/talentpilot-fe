import type { Metadata } from "next";
import { PromptManagement } from "@/features/admin/components/prompt-management";

export const metadata: Metadata = { title: "Prompt versions" };

export default function PromptsPage() {
  return <PromptManagement />;
}
