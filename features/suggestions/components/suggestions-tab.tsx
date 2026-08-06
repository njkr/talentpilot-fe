"use client";

import { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSuggestions } from "../hooks/use-suggestions";
import { useApplySuggestions } from "../hooks/use-apply-suggestions";
import { SuggestionCard } from "./suggestion-card";

export function SuggestionsTab({ workspaceId, resumeId, active }: { workspaceId: string; resumeId: string; active: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: suggestions, isLoading } = useSuggestions(workspaceId, active);
  const apply = useApplySuggestions(workspaceId);

  if (isLoading) return <SuggestionsSkeleton />;
  if (!suggestions?.length) return <EmptyState title="No pending suggestions" description="You've reviewed everything the optimizer proposed." />;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // needs_info rows aren't apply-able — their newText/exampleValue are illustrative-only until
  // the user supplies a real detail via NeedsInfoCard — so they're excluded from bulk selection.
  const selectable = suggestions.filter((s) => s.status !== "needs_info");
  const needsInfoCount = suggestions.length - selectable.length;

  return (
    <div className="space-y-4">
      {/* Reassure the user these are fact-checked — it's a real differentiator (the backend's
          fabrication guard, confirmed in the API doc's own testing notes). */}
      <div className="rounded-lg bg-primary/[0.04] px-4 py-3 text-sm text-ink-secondary">
        <ShieldCheckIcon className="mr-1.5 inline h-4 w-4 text-primary" />
        Every suggestion is checked against your original resume — invented metrics, employers, and credentials are removed before you see them.
      </div>

      <div className="flex items-center justify-between">
        <Body>
          {selectable.length} pending{needsInfoCount > 0 ? ` · ${needsInfoCount} need more detail` : ""} · {selected.size} selected
        </Body>
        {selectable.length > 0 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set(selectable.map((s) => s.id)))}>
              Select all
            </Button>
            <Button
              size="sm"
              disabled={selected.size === 0}
              loading={apply.isPending}
              onClick={() =>
                apply.mutate([...selected], {
                  onSuccess: () => setSelected(new Set()),
                })
              }
            >
              Apply {selected.size || ""}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} workspaceId={workspaceId} resumeId={resumeId} selected={selected.has(s.id)} onToggle={() => toggle(s.id)} />
        ))}
      </div>
    </div>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}
