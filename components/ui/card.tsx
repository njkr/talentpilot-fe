import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("bg-card border border-border rounded-xl p-6 shadow-sm", className)}>{children}</div>;
}
