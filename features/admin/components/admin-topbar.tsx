"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores/auth.store";

export function AdminTopbar() {
  const email = useAuthStore((s) => s.user?.email);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to app
      </Link>
      <div className="flex-1" />
      {email && <span className="text-xs text-ink-muted">{email}</span>}
    </header>
  );
}
