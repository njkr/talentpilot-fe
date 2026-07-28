"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { adminNavItems } from "../admin-nav-items";
import { cn } from "@/lib/utils";

// Deliberately plainer than the user app's Sidebar (components/layout/sidebar.tsx) — no collapse
// animation, no tooltips, static width. The visual flatness is itself the "you are in a different,
// operational surface" signal the doc asks for.
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-52 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Logo size={20} wordmarkClassName="text-sm font-semibold" />
        <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">ADMIN</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {adminNavItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active ? "bg-bg text-ink" : "text-ink-secondary hover:bg-bg hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
