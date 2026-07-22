import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type EmptyStateAction = { label: string; onClick: () => void } | { label: string; href: string };

interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  compact?: boolean;
  className?: string;
}

// Every empty list uses this — no data means guidance, not a blank rectangle.
export function EmptyState({ icon: Icon, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 text-center", compact ? "py-6" : "py-12", className)}>
      {Icon && <Icon className="h-10 w-10 text-ink-muted" aria-hidden="true" />}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-secondary max-w-sm">{description}</p>}
      {action &&
        ("href" in action ? (
          <Button size="sm" className="mt-2" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button size="sm" className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
