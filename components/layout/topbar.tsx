"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, BoltIcon } from "@heroicons/react/24/outline";
import { useUiStore } from "@/stores/ui.store";
import { useCredits } from "@/features/credits/credits.hooks";
import { NotificationBell } from "./notification-bell";
import { AvatarMenu } from "./avatar-menu";
import { MobileNav } from "./mobile-nav";

export function Topbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-sm sm:px-6">
      {/* Below lg: opens the drawer. At lg+: the same icon toggles the sidebar's collapsed
          state instead — two elements swapped by breakpoint so it reads as one consistent button. */}
      <button onClick={() => setMobileNavOpen(true)} className="lg:hidden text-ink-secondary hover:text-ink" aria-label="Open menu">
        <Bars3Icon className="h-6 w-6" />
      </button>
      <button onClick={toggleSidebar} className="hidden lg:inline-flex text-ink-secondary hover:text-ink" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="flex-1" /> {/* spacer pushes everything right */}

      <CreditBadge />
      <NotificationBell />
      <AvatarMenu />

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </header>
  );
}

// The credit balance is React Query key ['credits']. When a later sprint's mutation spends
// credits (analyze, regenerate), it invalidates that key and this badge updates automatically.
function CreditBadge() {
  const { data } = useCredits();
  return (
    <Link href="/billing" className="flex items-center gap-1.5 rounded-lg bg-bg px-3 py-1.5 text-sm font-medium text-ink hover:bg-border/40">
      <BoltIcon className="h-4 w-4 text-primary" />
      {data?.balance ?? "—"} credits
    </Link>
  );
}
