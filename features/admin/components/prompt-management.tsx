"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { H1, Body, Caption } from "@/components/ui/typography";
import { cn, timeAgo } from "@/lib/utils";
import { useActivatePrompt, usePromptVersions } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { PromptVersion } from "../admin.types";

// Confirmed live 2026-07-25 — the full 9-key set here is real (each 404s to an empty array, not
// an error, when no version has ever been created for that key yet: resume_parsing, interview,
// and learning_path all currently have zero versions in this environment).
const PROMPT_KEYS = ["resume_parsing", "jd_analysis", "ats_grading", "resume_optimization", "cover_letter", "interview", "learning_path", "company_synthesis", "salary"];

export function PromptManagement() {
  const [selectedKey, setSelectedKey] = useState(PROMPT_KEYS[0]);
  const { data: versions, isLoading, error } = usePromptVersions(selectedKey);
  const [confirming, setConfirming] = useState<PromptVersion | null>(null);

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-4">
        <H1>Prompt versions</H1>

        <Select value={selectedKey} onValueChange={setSelectedKey} options={PROMPT_KEYS.map((k) => ({ value: k, label: k }))} />

        {isLoading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : !versions?.length ? (
          <Caption>No versions created for this key yet.</Caption>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => (
              <VersionCard key={v.version} version={v} onActivate={() => setConfirming(v)} />
            ))}
          </div>
        )}
      </div>

      <ActivateConfirm promptKey={selectedKey} version={confirming} onClose={() => setConfirming(null)} />
    </AdminQueryBoundary>
  );
}

function VersionCard({ version: v, onActivate }: { version: PromptVersion; onActivate: () => void }) {
  return (
    <Card className={cn(v.isActive && "border-success/40 ring-1 ring-success/20")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">v{v.version}</span>
            {v.isActive && <Badge tone="success">Active</Badge>}
            <Caption>
              {v.model} · {timeAgo(v.createdAt)}
            </Caption>
          </div>
          {v.changeNote && <Body className="mt-1 text-ink-secondary">{v.changeNote}</Body>}
          {/* Long, often multi-paragraph — collapsed by default (matches the dead-letter queue's
              job-data disclosure: a plain <details> needs no extra state for local expand/collapse). */}
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-ink-secondary hover:text-ink">System prompt</summary>
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-bg p-3 font-mono text-xs text-ink-secondary">{v.systemTemplate}</pre>
          </details>
        </div>
        {!v.isActive && (
          <Button size="sm" variant="secondary" onClick={onActivate} className="shrink-0">
            Activate
          </Button>
        )}
      </div>
    </Card>
  );
}

// Activating silently changes every user's output — worth a confirm step, not a bare click.
function ActivateConfirm({ promptKey, version, onClose }: { promptKey: string; version: PromptVersion | null; onClose: () => void }) {
  const activate = useActivatePrompt(promptKey);

  return (
    <Modal open={version != null} onClose={onClose} title="Activate this version?">
      {version && (
        <div className="space-y-4">
          <Body>
            This makes v{version.version} of <span className="font-mono">{promptKey}</span> live for every run started from now on. Nothing in progress is affected, but this can&apos;t be
            undone by closing this dialog — you&apos;d need to activate a different version to revert.
          </Body>
          <div className="flex gap-2">
            <Button
              loading={activate.isPending}
              onClick={() =>
                activate.mutate(version.version, {
                  onSuccess: onClose,
                })
              }
            >
              Activate v{version.version}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
