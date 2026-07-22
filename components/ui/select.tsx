"use client";

import type { ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Select({ value, onValueChange, options, placeholder, label, className }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <span className="text-sm font-medium text-ink">{label}</span>}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-sm text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
            "data-[placeholder]:text-ink-muted",
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDownIcon className="h-4 w-4 text-ink-muted" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="z-50 overflow-hidden rounded-lg border border-border bg-card shadow-md">
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-7 pr-2 text-sm text-ink outline-none",
        "data-[highlighted]:bg-bg",
      )}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
        <CheckIcon className="h-3.5 w-3.5 text-primary" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
