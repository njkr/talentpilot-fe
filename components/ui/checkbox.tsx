"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  id?: string;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, label, id, className }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        className={cn(
          "h-4 w-4 shrink-0 rounded border border-border bg-card",
          "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          className,
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
          <CheckIcon className="h-3 w-3" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
      )}
    </div>
  );
}
