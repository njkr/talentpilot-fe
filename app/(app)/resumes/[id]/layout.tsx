import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resume" };

export default function ResumeDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
