import type { Metadata } from "next";

export const metadata: Metadata = { title: "Component kit" };

export default function KitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
