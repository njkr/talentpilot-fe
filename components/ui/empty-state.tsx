import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

// Every empty list uses this — no data means guidance, not a blank rectangle.
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-12 text-center", className)}>
      {Icon && <Icon className="h-10 w-10 text-ink-muted" aria-hidden="true" />}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-secondary max-w-sm">{description}</p>}
      {action && (
        <Button size="sm" className="mt-2" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
