import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  tone?: "danger" | "warning" | "success";
}

export function FilterChip({ active, onClick, tone, children }: PropsWithChildren<FilterChipProps>) {
  const toneClass = tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-ink-secondary";
  return (
    <button onClick={onClick} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", active ? cn("bg-bg", toneClass) : "text-ink-muted hover:bg-bg hover:text-ink-secondary")}>
      {children}
    </button>
  );
}
