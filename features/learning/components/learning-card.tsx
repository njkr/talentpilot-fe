import { AcademicCapIcon, BookOpenIcon, DocumentTextIcon, NewspaperIcon, VideoCameraIcon, FolderIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { hasRealUrl, type LearningItem } from "../learning.types";

// Partial, with a runtime fallback below — resourceType is now typed with a `string` escape hatch
// (a real value, "project", was already missing from the old closed union; a Record<T, X> with an
// exhaustive-looking type silently hid that gap until a real item with that value crashed here).
const resourceIcons: Partial<Record<string, typeof AcademicCapIcon>> = {
  course: AcademicCapIcon,
  book: BookOpenIcon,
  documentation: DocumentTextIcon,
  article: NewspaperIcon,
  video: VideoCameraIcon,
  project: FolderIcon,
};

export function LearningCard({ item, index }: { item: LearningItem; index: number }) {
  const Icon = resourceIcons[item.resourceType] ?? DocumentTextIcon;
  const hasUrl = hasRealUrl(item.url);
  const hasAffiliate = hasRealUrl(item.affiliateUrl);

  return (
    <Card>
      <div className="flex gap-4">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-bg text-xs font-semibold text-ink-secondary">{index}</span>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={item.priority} />
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Icon className="h-3.5 w-3.5" />
              {item.resourceType}
            </span>
            <Caption>~{item.estHours}h</Caption>
          </div>

          <p className="text-sm font-medium text-ink">{item.title}</p>
          <Body className="mt-1">{item.gapReason}</Body>

          {/* url (the AI's own guess) and affiliateUrl (admin-configured) are rendered as
              distinct, separately-labeled links — never merged into one, since affiliateUrl is a
              generic search/template link while a real url (rare) is a specific match; silently
              preferring one over the other would be a downgrade either way. */}
          {!hasUrl && !hasAffiliate && <Caption className="mt-1 block">Search for this resource by title</Caption>}
          {(hasUrl || hasAffiliate) && (
            <div className="mt-2 flex flex-wrap gap-4">
              {hasUrl && (
                <a href={item.url as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  View resource
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {hasAffiliate && (
                <a href={item.affiliateUrl as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-success hover:underline">
                  Buy / Enroll
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

const PriorityBadge = ({ priority }: { priority: LearningItem["priority"] }) => (
  <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", priority === "required" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary")}>{priority === "required" ? "Required gap" : "Preferred"}</span>
);
