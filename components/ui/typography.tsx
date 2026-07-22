import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type TextProps = PropsWithChildren<{ className?: string }>;

// One place that defines the type hierarchy. Screens use <H1>, <H2>, <Body>, never raw text-3xl.
export function H1({ children, className }: TextProps) {
  return <h1 className={cn("text-2xl font-bold tracking-tight text-ink", className)}>{children}</h1>;
}

export function H2({ children, className }: TextProps) {
  return <h2 className={cn("text-xl font-semibold text-ink", className)}>{children}</h2>;
}

export function H3({ children, className }: TextProps) {
  return <h3 className={cn("text-base font-semibold text-ink", className)}>{children}</h3>;
}

export function Body({ children, className }: TextProps) {
  return <p className={cn("text-sm text-ink-secondary leading-relaxed", className)}>{children}</p>;
}

export function Caption({ children, className }: TextProps) {
  return <span className={cn("text-xs text-ink-muted", className)}>{children}</span>;
}
