"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

const NAV_LINKS = [
  { href: "/ats-resume-checker", label: "ATS Checker" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

// The one client component in the header (needs useState for the mobile toggle) — everything it
// renders is still plain server-emitted HTML on first paint since Next inlines the client
// component's own initial (closed) render into the SSR output.
export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="shrink-0">
          <Logo size={32} wordmarkClassName="text-xl" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-ink-secondary hover:text-ink">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm text-ink-secondary hover:text-ink">
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link href="/onboarding">Get started free</Link>
          </Button>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <XMarkIcon className="h-6 w-6 text-ink" /> : <Bars3Icon className="h-6 w-6 text-ink" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink-secondary hover:bg-bg hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-ink-secondary hover:bg-bg hover:text-ink"
            >
              Sign in
            </Link>
            <Button asChild size="lg" className="mt-2 w-full">
              <Link href="/onboarding" onClick={() => setOpen(false)}>
                Get started free
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
