"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/features/auth/auth.hooks";

export function AvatarMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const initials = user?.email.slice(0, 2).toUpperCase() ?? "?";

  return (
    <Menu.Root>
      <Menu.Trigger aria-label="Account menu" className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {initials}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={8} className="z-50 min-w-48 rounded-lg border border-border bg-card p-1 shadow-md">
          <div className="px-3 py-2 text-sm text-ink-secondary truncate">{user?.email}</div>
          <Menu.Separator className="my-1 h-px bg-border" />
          <MenuLink href="/settings">Settings</MenuLink>
          <MenuLink href="/billing">Billing</MenuLink>
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Item
            onSelect={() => logout.mutate()}
            className="cursor-pointer rounded-md px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-danger/10"
          >
            Sign out
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

function MenuLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Menu.Item asChild className="cursor-pointer rounded-md text-sm text-ink outline-none data-[highlighted]:bg-bg">
      <Link href={href} className="block px-3 py-2">
        {children}
      </Link>
    </Menu.Item>
  );
}
