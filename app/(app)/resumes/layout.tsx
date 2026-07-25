import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resumes" };

export default function ResumesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
