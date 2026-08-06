"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "@/components/layout/logo";
import { adminNavItems } from "../admin-nav-items";
import { cn } from "@/lib/utils";

interface AdminMobileNavProps {
  open: boolean;
  onClose: () => void;
}

// Direct port of components/layout/mobile-nav.tsx's structure (same Radix Dialog drawer, same
// focus-trap/escape/scroll-lock guarantees for free) — the admin surface had no mobile nav
// substitute at all for AdminSidebar's `hidden ... lg:flex`, making all 12 admin sections
// unreachable below `lg`. Renders adminNavItems and the same Logo + "ADMIN" badge treatment
// AdminSidebar's own header uses, so the drawer reads as part of this surface, not a mis-themed
// copy of the main app's drawer.
export function AdminMobileNav({ open, onClose }: AdminMobileNavProps) {
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 lg:hidden data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-64 bg-card p-4 lg:hidden data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
          <Dialog.Title asChild>
            <div className="mb-6 flex items-center gap-2">
              <Logo size={20} wordmarkClassName="text-sm font-semibold" />
              <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">ADMIN</span>
            </div>
          </Dialog.Title>
          <nav className="space-y-1">
            {adminNavItems.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    active ? "bg-bg text-ink" : "text-ink-secondary hover:bg-bg",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
