import Link from "next/link";
import { ExclamationTriangleIcon, SparklesIcon, BoltIcon, UserCircleIcon, DocumentIcon, InformationCircleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import type { ActionItem } from "../dashboard.api";

const ICONS: Record<string, typeof ExclamationTriangleIcon> = {
  failed_run: ExclamationTriangleIcon,
  pending_suggestions: SparklesIcon,
  low_credits: BoltIcon,
  incomplete_profile: UserCircleIcon,
  stale_document: DocumentIcon,
};

const TONE: Record<ActionItem["priority"], string> = {
  high: "border-danger/30 bg-danger/[0.03]",
  medium: "border-warning/30 bg-warning/[0.03]",
  low: "border-border bg-card",
};

const ICON_TONE: Record<ActionItem["priority"], string> = {
  high: "text-danger",
  medium: "text-warning",
  low: "text-ink-muted",
};

// The dashboard's highest-value addition: turns a status badge the user has to notice and
// interpret into an explicit "here's what to do" list at the very top of the page. `kind` is
// typed as `string` (not a closed union) since the real API doesn't guarantee this list is
// exhaustive — the fallback icon/tone below cover any kind not in the maps.
export function ActionItems({ items }: { items: ActionItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const Icon = ICONS[item.kind] ?? InformationCircleIcon;
        return (
          <Link
            key={`${item.kind}-${i}`}
            href={item.href}
            className={cn("flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-bg", TONE[item.priority] ?? TONE.low)}
          >
            <Icon className={cn("h-5 w-5 shrink-0", ICON_TONE[item.priority] ?? ICON_TONE.low)} />
            <span className="flex-1 text-sm text-ink">{item.label}</span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
          </Link>
        );
      })}
    </div>
  );
}
