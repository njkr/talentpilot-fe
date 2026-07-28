"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/ui.store";
import { Tooltip } from "@/components/ui/tooltip";
import { Logo } from "./logo";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    // Hidden on mobile (drawer takes over) — see MobileNav.
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card lg:flex",
        "transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-14 items-center px-4">
        <Logo size={24} showWordmark={!collapsed} wordmarkClassName="text-base" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          // Active when the path starts with the item's href — so /resumes/123 keeps Resumes active.
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const link = (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-ink-secondary hover:bg-bg hover:text-ink",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn(collapsed && "sr-only")}>{label}</span>
            </Link>
          );
          // Collapsed labels are visually hidden (sr-only) — a tooltip covers sighted users.
          return collapsed ? (
            <Tooltip key={href} content={label}>
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>
    </aside>
  );
}
