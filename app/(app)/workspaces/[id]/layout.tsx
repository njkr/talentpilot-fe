import type { Metadata } from "next";

export const metadata: Metadata = { title: "Workspace" };

export default function WorkspaceDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
