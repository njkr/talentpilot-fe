import type { PropsWithChildren } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      neutral: "bg-bg text-ink-secondary border border-border",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      danger: "bg-danger/10 text-danger",
      primary: "bg-primary/10 text-primary",
    },
  },
  defaultVariants: { tone: "neutral" },
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
}

export function Badge({ tone, className, children }: PropsWithChildren<BadgeProps>) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}
