"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10", className)}>
      {src && <AvatarPrimitive.Image src={src} alt={name} className="h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback className="text-xs font-medium text-primary">{initials(name)}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
