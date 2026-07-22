"use client";

import type { PropsWithChildren } from "react";
import { useUiStore } from "@/stores/ui.store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: PropsWithChildren) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-bg">
        {/* Desktop sidebar — fixed, width animates on collapse */}
        <Sidebar />

        {/* Content column — offset by the sidebar width on desktop, full-width on mobile.
            Padding-left (not margin) because the sidebar is position:fixed and out of flow;
            padding reserves its space and animates cleanly on collapse. */}
        <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-16" : "lg:pl-60")}>
          <Topbar />
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
