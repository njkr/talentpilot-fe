"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  "aria-label": string;
  disabled?: boolean;
}

// Notification preferences (Sprint 11) is the first opt-out toggle in the app — Checkbox (tri-state,
// form-field semantics) doesn't fit an immediate on/off preference the way a switch does.
export function Switch({ checked, onCheckedChange, disabled, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        checked ? "bg-primary" : "bg-border",
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn("block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform", "data-[state=checked]:translate-x-4")}
      />
    </SwitchPrimitive.Root>
  );
}
