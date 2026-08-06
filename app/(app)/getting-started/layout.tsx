import type { Metadata } from "next";

export const metadata: Metadata = { title: "Getting started" };

export default function GettingStartedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
