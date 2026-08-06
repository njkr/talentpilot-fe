import type { ComponentType, ReactNode, SVGProps } from "react";
import { Card } from "@/components/ui/card";
import { Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger";

const ICON_TONE: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

interface MetricCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  children?: ReactNode; // mini-viz slot, fixed height so all 4 cards in the row line up
  footer?: ReactNode; // optional conditional CTA under the mini-viz
}

// Shared shell for the dashboard's compact bento metrics row — one visual language (icon chip,
// big value, sub-caption, fixed-height mini-viz slot) so Credits/Score/Activity/Workspaces read as
// one coherent row instead of four differently-styled cards.
export function MetricCard({ icon: Icon, label, value, sub, tone = "primary", children, footer }: MetricCardProps) {
  return (
    <Card className="p-4 transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg", ICON_TONE[tone])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <Caption>{label}</Caption>
      </div>
      <div className="mt-3 text-2xl font-bold text-ink">{value}</div>
      {sub && <Caption className="mt-0.5 block truncate">{sub}</Caption>}
      {children && <div className="mt-3 h-10">{children}</div>}
      {footer && <div className="mt-3">{footer}</div>}
    </Card>
  );
}
