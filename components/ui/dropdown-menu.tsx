"use client";

import type { ReactNode } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface DropdownMenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "center" | "end";
}

// Avatar menu (Sprint 2) and similar action menus use this.
export function DropdownMenu({ trigger, items, align = "end" }: DropdownMenuProps) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align={align}
          sideOffset={6}
          className={cn(
            "z-50 min-w-40 rounded-lg border border-border bg-card p-1 shadow-md",
            "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
          )}
        >
          {items.map((item) => (
            <DropdownPrimitive.Item
              key={item.label}
              onSelect={item.onSelect}
              className={cn(
                "cursor-pointer select-none rounded-md px-2 py-1.5 text-sm outline-none",
                "data-[highlighted]:bg-bg",
                item.danger ? "text-danger" : "text-ink",
              )}
            >
              {item.label}
            </DropdownPrimitive.Item>
          ))}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
