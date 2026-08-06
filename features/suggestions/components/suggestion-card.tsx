import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Caption } from "@/components/ui/typography";
import { ImpactBadge } from "@/components/ui/impact-badge";
import { cn } from "@/lib/utils";
import { NeedsInfoCard } from "./needs-info-card";
import type { AiSuggestion } from "../suggestion.types";

// `newText` consistently arrives wrapped in literal quote characters baked into the string
// itself (confirmed live) — strip one layer of matching leading/trailing quotes for display.
function stripWrappingQuotes(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

interface SuggestionCardProps {
  suggestion: AiSuggestion;
  workspaceId: string;
  resumeId: string;
  selected: boolean;
  onToggle: () => void;
}

export function SuggestionCard({ suggestion, workspaceId, resumeId, selected, onToggle }: SuggestionCardProps) {
  // Not applyable/selectable — a distinct card with its own resubmit/skip actions.
  if (suggestion.status === "needs_info") {
    return <NeedsInfoCard suggestion={suggestion} workspaceId={workspaceId} resumeId={resumeId} />;
  }

  return (
    <Card className={cn("transition-colors", selected && "border-primary bg-primary/[0.02]")}>
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label={`Select suggestion for ${suggestion.sectionType}`} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ImpactBadge impact={suggestion.impact} />
            <Caption className="capitalize">{suggestion.sectionType}</Caption>
          </div>

          {/* Old -> new, visually distinct. Strikethrough on the old makes the change obvious
              at a glance without needing a word-level diff here (that's Sprint 7's version diff). */}
          <div className="space-y-2">
            <div className="rounded-lg bg-danger/[0.04] px-3 py-2">
              <Caption className="mb-1 block text-danger">Current</Caption>
              <p className="text-sm text-ink-secondary line-through decoration-danger/40">{suggestion.oldText}</p>
            </div>
            <div className="rounded-lg bg-success/[0.04] px-3 py-2">
              <Caption className="mb-1 block text-success">Suggested</Caption>
              <p className="text-sm text-ink">{stripWrappingQuotes(suggestion.newText)}</p>
            </div>
          </div>

          <p className="text-xs text-ink-secondary">
            <span className="font-medium text-ink">Why: </span>
            {suggestion.reason}
          </p>

          {suggestion.keywordsAdded.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestion.keywordsAdded.map((k) => (
                <span key={k} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  +{k}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
