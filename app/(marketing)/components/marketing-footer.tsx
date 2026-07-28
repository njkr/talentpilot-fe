import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "/ats-resume-checker", label: "ATS Resume Checker" },
      { href: "/ai-cover-letter", label: "AI Cover Letter" },
      { href: "/resume-optimizer", label: "Resume Optimizer" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/register", label: "Get started free" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo size={28} />
            <p className="mt-3 max-w-xs text-sm text-ink-secondary">
              AI resume optimizer and ATS checker that never invents experience you don&apos;t have.
            </p>
          </div>
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h2 className="text-sm font-semibold text-ink">{col.heading}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-secondary hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} TalentPilot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
