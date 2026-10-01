import type { ButtonHTMLAttributes, ComponentType, SVGProps } from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  // base: shared by every variant — focus ring, disabled, transition (150ms per the design doc)
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors " +
    "duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
    "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover",
        secondary: "bg-card text-ink border border-border hover:bg-bg",
        ghost: "text-ink-secondary hover:bg-bg hover:text-ink",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: { sm: "h-8 px-3", md: "h-9 px-4", lg: "h-10 px-5" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean; // render as a child element (e.g. a Next <Link>) via Radix Slot
  // A leading Heroicon (24/outline, matching every icon already used in this project — see
  // DEVELOPMENT-NOTES.md's design tokens rule). While `loading` is true the Spinner takes this same leading
  // slot instead, so a button never shows both at once.
  icon?: IconComponent;
}

export function Button({ className, variant, size, loading, asChild, icon: Icon, children, disabled, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Spinner className="h-4 w-4 shrink-0" /> : Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {/* Slot (asChild) requires exactly one element child to clone onto — Slottable marks which
          child that is, so the spinner/icon can still render as a sibling instead of breaking
          Slot's "single child" requirement. A no-op wrapper when asChild is false. */}
      <Slottable>{children}</Slottable>
    </Comp>
  );
}
