import { cn } from "@/lib/utils";

// Every loading state uses this — no layout shift, no spinner-only screens.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-border/50 rounded-md", className)} />;
}
