import type { Metadata } from "next";

export const metadata: Metadata = { title: "New job description" };

export default function NewJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
