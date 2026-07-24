"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ChipGroup } from "@/components/ui/chip-group";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { H3, Caption } from "@/components/ui/typography";
import { useCoverLetter } from "../hooks/use-cover-letter";
import { useRegenerateCoverLetter } from "../hooks/use-regenerate";
import type { CoverLetter } from "../cover-letter.types";

export function CoverLetterTab({ workspaceId, active }: { workspaceId: string; active: boolean }) {
  const { data: letter, isLoading } = useCoverLetter(workspaceId, active);
  const regenerate = useRegenerateCoverLetter(workspaceId);

  const [tone, setTone] = useState<CoverLetter["tone"]>("professional");
  const [length, setLength] = useState<CoverLetter["length"]>("standard");

  // Sync the controls to the current letter once it loads — adjusted during render (guarded by
  // comparing against the last-seen letter id), not via useEffect. React's own purity rules flag
  // a synchronous setState inside an effect body; adjusting state while rendering in response to a
  // changed prop is the pattern React's docs recommend instead, and avoids the extra effect-driven
  // render pass this would otherwise cost.
  const [syncedLetterId, setSyncedLetterId] = useState<string | null>(null);
  if (letter && letter.id !== syncedLetterId) {
    setSyncedLetterId(letter.id);
    setTone(letter.tone);
    setLength(letter.length);
  }

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  // A 404 (no letter generated yet) and "no data" both land here as `!letter` — the empty state's
  // copy and the Regenerate button below cover both cases identically, since the action is the
  // same either way: generate one now.
  if (!letter) {
    return (
      <div className="space-y-4">
        <EmptyState title="No cover letter yet" description="Generate one now, choosing a tone and length." />
        <Card>
          <RegenerateControls tone={tone} setTone={setTone} length={length} setLength={setLength} onRegenerate={() => regenerate.mutate({ tone, length })} pending={regenerate.isPending} canRegenerate />
        </Card>
      </div>
    );
  }

  // Enabled once something changed, OR after a failed attempt (so retrying doesn't require
  // fiddling with a chip first just to re-enable the button).
  const dirty = tone !== letter.tone || length !== letter.length;
  const canRegenerate = dirty || regenerate.isError;

  return (
    <div className="space-y-4">
      <Card>
        <RegenerateControls tone={tone} setTone={setTone} length={length} setLength={setLength} onRegenerate={() => regenerate.mutate({ tone, length })} pending={regenerate.isPending} canRegenerate={canRegenerate} />
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <H3>Your cover letter</H3>
            <Caption>
              v{letter.version} · {letter.wordCount} words
            </Caption>
          </div>
          <CopyButton text={letter.content} />
        </div>
        {/* whitespace-pre-wrap preserves the paragraph breaks the model produced. */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink-secondary">{letter.content}</div>
      </Card>
    </div>
  );
}

interface RegenerateControlsProps {
  tone: CoverLetter["tone"];
  setTone: (t: CoverLetter["tone"]) => void;
  length: CoverLetter["length"];
  setLength: (l: CoverLetter["length"]) => void;
  onRegenerate: () => void;
  pending: boolean;
  canRegenerate: boolean;
}

function RegenerateControls({ tone, setTone, length, setLength, onRegenerate, pending, canRegenerate }: RegenerateControlsProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-3">
        <div>
          <Caption className="mb-1.5 block">Tone</Caption>
          <ChipGroup
            value={tone}
            onChange={setTone}
            options={[
              { value: "professional", label: "Professional" },
              { value: "friendly", label: "Friendly" },
              { value: "confident", label: "Confident" },
              { value: "enthusiastic", label: "Enthusiastic" },
            ]}
          />
        </div>
        <div>
          <Caption className="mb-1.5 block">Length</Caption>
          <ChipGroup
            value={length}
            onChange={setLength}
            options={[
              { value: "short", label: "Short" },
              { value: "standard", label: "Standard" },
              { value: "long", label: "Long" },
            ]}
          />
        </div>
      </div>

      <Button onClick={onRegenerate} loading={pending} disabled={!canRegenerate}>
        {/* Show the cost ON the button — never surprise someone with a charge. */}
        Regenerate — 2 credits
      </Button>
    </div>
  );
}
