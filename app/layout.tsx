import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Display-only face for the brand wordmark (Logo component) — the app body copy stays on Inter/
// font-sans throughout; this is deliberately narrow-scoped, not a site-wide font swap.
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-plus-jakarta-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "TalentPilot", template: "%s · TalentPilot" },
  description: "AI-powered resume tailoring and career prep",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
