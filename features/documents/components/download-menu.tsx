"use client";

import { ArrowDownTrayIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Caption } from "@/components/ui/typography";
import { useDocuments, useDownloadDocument } from "../hooks/use-documents";
import { DOCUMENT_LABELS, DOCUMENT_TYPES, type DocumentType, type GeneratedDocument } from "../document.types";

export function DownloadMenu({ workspaceId }: { workspaceId: string }) {
  const { data: documents } = useDocuments(workspaceId);
  const { request, downloadReady, pendingType } = useDownloadDocument(workspaceId);

  // Only the most recently requested document per type matters for what action to offer.
  const latestByType = new Map<DocumentType, GeneratedDocument>();
  for (const doc of documents ?? []) {
    const existing = latestByType.get(doc.type);
    if (!existing || doc.createdAt > existing.createdAt) latestByType.set(doc.type, doc);
  }

  return (
    <Popover
      trigger={
        <Button variant="secondary" size="sm">
          <ArrowDownTrayIcon className="h-4 w-4" />
          Download
        </Button>
      }
      className="w-72"
    >
      <Caption className="mb-2 px-1">Generate & download</Caption>
      <div className="space-y-1">
        {DOCUMENT_TYPES.map((type) => {
          const doc = latestByType.get(type);
          const isPending = pendingType === type;
          return (
            <div key={type} className="flex items-center justify-between rounded-md px-1 py-1.5">
              <span className="text-sm text-ink">{DOCUMENT_LABELS[type]}</span>
              <Row doc={doc} isPending={isPending} onGenerate={() => request(type)} onDownload={() => doc && downloadReady(doc)} />
            </div>
          );
        })}
      </div>
    </Popover>
  );
}

function Row({ doc, isPending, onGenerate, onDownload }: { doc: GeneratedDocument | undefined; isPending: boolean; onGenerate: () => void; onDownload: () => void }) {
  if (isPending || doc?.status === "queued" || doc?.status === "generating") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Spinner className="h-3.5 w-3.5" />
        Generating…
      </span>
    );
  }

  // `stale` must NOT offer a direct download — CLAUDE.md: treat stale the same as not ready.
  if (doc?.status === "stale") {
    return (
      <Button variant="ghost" size="sm" onClick={onGenerate} className="h-7 px-2 text-xs" title="This file no longer matches the current resume/cover letter">
        <ExclamationTriangleIcon className="h-3.5 w-3.5 text-warning" />
        Regenerate
      </Button>
    );
  }

  if (doc?.status === "failed") {
    return (
      <Button variant="ghost" size="sm" onClick={onGenerate} className="h-7 px-2 text-xs text-danger">
        Retry
      </Button>
    );
  }

  if (doc?.status === "ready") {
    return (
      <Button variant="ghost" size="sm" onClick={onDownload} className="h-7 px-2 text-xs">
        Download
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={onGenerate} className="h-7 px-2 text-xs">
      Generate
    </Button>
  );
}
