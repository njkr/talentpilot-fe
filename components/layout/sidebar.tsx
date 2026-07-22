"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useUiStore } from "@/stores/ui.store";
import { Tooltip } from "@/components/ui/tooltip";
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
        <span className={cn("font-bold text-primary", collapsed && "sr-only")}>TalentPilot</span>
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

      <CollapseToggle />
    </aside>
  );
}

function CollapseToggle() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <button
      onClick={toggleSidebar}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex items-center justify-center gap-2 border-t border-border px-3 py-3 text-sm text-ink-secondary hover:bg-bg hover:text-ink"
    >
      {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
      {!collapsed && "Collapse"}
    </button>
  );
}
