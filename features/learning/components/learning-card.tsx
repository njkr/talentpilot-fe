import { AcademicCapIcon, BookOpenIcon, DocumentTextIcon, NewspaperIcon, VideoCameraIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { hasRealUrl, type LearningItem } from "../learning.types";

const resourceIcons: Record<LearningItem["resourceType"], typeof AcademicCapIcon> = {
  course: AcademicCapIcon,
  book: BookOpenIcon,
  documentation: DocumentTextIcon,
  article: NewspaperIcon,
  video: VideoCameraIcon,
};

export function LearningCard({ item, index }: { item: LearningItem; index: number }) {
  const Icon = resourceIcons[item.resourceType];
  const linkable = hasRealUrl(item.url);

  const body = (
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

        <p className={cn("text-sm font-medium", linkable ? "text-primary" : "text-ink")}>
          {item.title}
          {linkable && <ArrowTopRightOnSquareIcon className="ml-1 inline h-3.5 w-3.5" />}
        </p>
        <Body className="mt-1">{item.gapReason}</Body>

        {/* Be explicit when there's no real link so it doesn't look like a broken card. */}
        {!linkable && <Caption className="mt-1 block">Search for this resource by title</Caption>}
      </div>
    </div>
  );

  if (linkable) {
    return (
      <Card className="hover:border-ink-muted transition-colors">
        <a href={item.url as string} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      </Card>
    );
  }
  return <Card>{body}</Card>;
}

const PriorityBadge = ({ priority }: { priority: LearningItem["priority"] }) => (
  <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", priority === "required" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary")}>{priority === "required" ? "Required gap" : "Preferred"}</span>
);
