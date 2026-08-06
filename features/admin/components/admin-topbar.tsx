"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores/auth.store";
import { AdminMobileNav } from "./admin-mobile-nav";

export function AdminTopbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const email = useAuthStore((s) => s.user?.email);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      {/* AdminSidebar is hidden below lg with no desktop collapse toggle to swap in (it's
          deliberately non-collapsible — see its own comment) — this button is the only mobile
          entry point to admin nav. */}
      <button onClick={() => setMobileNavOpen(true)} className="lg:hidden text-ink-secondary hover:text-ink" aria-label="Open menu">
        <Bars3Icon className="h-6 w-6" />
      </button>
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to app
      </Link>
      <div className="flex-1" />
      {email && <span className="text-xs text-ink-muted">{email}</span>}

      <AdminMobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </header>
  );
}
