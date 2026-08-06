import Link from "next/link";
import { ExclamationTriangleIcon, SparklesIcon, BoltIcon, UserCircleIcon, DocumentIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
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
  high: "border-danger/30 bg-danger/[0.06] text-danger hover:bg-danger/10",
  medium: "border-warning/30 bg-warning/[0.06] text-warning hover:bg-warning/10",
  low: "border-border bg-card text-ink-secondary hover:bg-bg",
};

// Condensed into wrapping pills (was full-width bordered rows) for a denser bento-style strip.
// `kind` stays typed as `string` (not a closed union) since the real API doesn't guarantee this
// list is exhaustive — the fallback icon/tone below cover any kind not in the maps.
export function ActionItems({ items }: { items: ActionItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => {
        const Icon = ICONS[item.kind] ?? InformationCircleIcon;
        return (
          <Link
            key={`${item.kind}-${i}`}
            href={item.href}
            className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", TONE[item.priority] ?? TONE.low)}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
