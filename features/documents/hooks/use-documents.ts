"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePollUntil } from "@/hooks/use-poll-until";
import { toast } from "@/components/ui/toast";
import { documentApi } from "../document.api";
import { isPollTerminal, type DocumentType, type GeneratedDocument } from "../document.types";

// Cheap single list call — unlike the workspace tabs (Sprint 6/8's `enabled: active` pattern for
// N parallel heavy artifact fetches), this is one lightweight row per document ever generated, so
// it's fetched eagerly whenever the download menu is mounted rather than gated on a tab/popover
// open state.
export function useDocuments(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "documents"],
    queryFn: () => documentApi.list(workspaceId),
  });
}

function triggerBrowserDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Owns the whole generate -> poll -> download lifecycle for one workspace's download menu.
// Only one document generates at a time from this UI, so a single `inFlight` slot (not one
// poller per type) is enough.
export function useDownloadDocument(workspaceId: string) {
  const queryClient = useQueryClient();
  const [inFlight, setInFlight] = useState<{ type: DocumentType; docId: string } | null>(null);

  const { data: polled } = usePollUntil<GeneratedDocument>(
    ["workspaces", workspaceId, "documents", inFlight?.docId ?? "none"],
    () => documentApi.get(workspaceId, inFlight!.docId),
    isPollTerminal,
    1500,
    Boolean(inFlight),
  );

  // Reached a terminal state -> react once via effect (network call + toast are real side
  // effects, not derived state, so this can't live in the render body — see purity rules noted
  // elsewhere in this codebase, e.g. cover-letter-tab.tsx). The setInFlight(null) call is
  // deferred into a setTimeout(…, 0), matching use-resume-status.ts/run-complete.tsx elsewhere in
  // this codebase — React's set-state-in-effect rule flags a setState call made synchronously in
  // an effect body, not one made from a nested callback.
  useEffect(() => {
    if (!inFlight || !polled || polled.id !== inFlight.docId || !isPollTerminal(polled)) return;

    queryClient.setQueryData<GeneratedDocument[]>(["workspaces", workspaceId, "documents"], (prev) => (prev ? prev.map((d) => (d.id === polled.id ? polled : d)) : prev));
    if (polled.status === "ready") {
      documentApi.download(workspaceId, polled.id).then(({ url, filename }) => triggerBrowserDownload(url, filename));
      toast(`${polled.filename} is ready`, "success");
    } else if (polled.status === "failed") {
      toast(polled.error ?? "Document generation failed", "error");
    } else {
      // stale: generated then immediately invalidated by something else mid-poll — rare, but
      // treat like a failure to generate rather than silently doing nothing.
      toast("This document went stale before it finished generating — try again", "warning");
    }
    const t = setTimeout(() => setInFlight(null), 0);
    return () => clearTimeout(t);
  }, [inFlight, polled, queryClient, workspaceId]);

  async function request(type: DocumentType) {
    const doc = await documentApi.generate(workspaceId, type);
    queryClient.setQueryData<GeneratedDocument[]>(["workspaces", workspaceId, "documents"], (prev) => (prev ? [doc, ...prev.filter((d) => d.type !== type)] : [doc]));
    setInFlight({ type, docId: doc.id });
  }

  // A document that's already `ready` from a previous generation -> skip straight to download,
  // no need to regenerate. `stale` deliberately does NOT go through this path (DEVELOPMENT-NOTES.md: treat
  // stale as not-ready) — callers should route stale documents through `request` instead.
  async function downloadReady(doc: GeneratedDocument) {
    const { url, filename } = await documentApi.download(workspaceId, doc.id);
    triggerBrowserDownload(url, filename);
  }

  return { request, downloadReady, pendingType: inFlight?.type ?? null };
}
