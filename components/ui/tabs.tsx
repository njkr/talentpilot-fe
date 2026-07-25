"use client";

import type { ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

// The workspace view (Sprint 6+) lives on these — score/keywords/suggestions/versions/cover-letter tabs.
export function Tabs({ items, defaultValue, value, onValueChange, className }: TabsProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue ?? items[0]?.value} value={value} onValueChange={onValueChange} className={className}>
      <TabsPrimitive.List className="flex gap-1 overflow-x-auto border-b border-border">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium text-ink-secondary border-b-2 border-transparent -mb-px",
              "hover:text-ink data-[state=active]:text-primary data-[state=active]:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-t-md",
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} value={item.value} className="pt-4">
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
