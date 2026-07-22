"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

// The pipeline progress bar (Sprint 5) is weighted 0-100 from the run, not a step count.
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <ProgressPrimitive.Root value={value} className={cn("relative h-2 w-full overflow-hidden rounded-md bg-border", className)}>
      <ProgressPrimitive.Indicator
        className="h-full bg-primary transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
