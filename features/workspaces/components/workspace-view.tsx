"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { ReportTab } from "@/features/report/components/report-tab";
import { SuggestionsTab } from "@/features/suggestions/components/suggestions-tab";
import { CoverLetterTab } from "@/features/cover-letter/components/cover-letter-tab";
import { WorkspaceHeader } from "./workspace-header";
import type { Workspace } from "../workspace.types";

// There's no aggregate endpoint for a workspace's artifacts (report, suggestions, cover letter,
// ...) — each tab fetches lazily via its own `active` flag so an unopened tab never fires a
// request. Sprint 8 tabs (interview, company, salary, learning) slot in here the same way.
export function WorkspaceView({ workspace }: { workspace: Workspace }) {
  const [tab, setTab] = useState("report");

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: "report", label: "ATS Report", content: <ReportTab workspaceId={workspace.id} active={tab === "report"} /> },
          { value: "suggestions", label: "Suggestions", content: <SuggestionsTab workspaceId={workspace.id} active={tab === "suggestions"} /> },
          { value: "cover-letter", label: "Cover Letter", content: <CoverLetterTab workspaceId={workspace.id} active={tab === "cover-letter"} /> },
        ]}
      />
    </div>
  );
}
