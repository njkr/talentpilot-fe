"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { ReportTab } from "@/features/report/components/report-tab";
import { SuggestionsTab } from "@/features/suggestions/components/suggestions-tab";
import { WorkspaceHeader } from "./workspace-header";
import type { Workspace } from "../workspace.types";

// There's no aggregate endpoint for a workspace's artifacts (report, suggestions, cover letter,
// ...) — each tab fetches lazily via its own `active` flag so an unopened tab never fires a
// request. Sprint 7/8 tabs (cover letter, versions, interview, company, salary, learning) slot in
// here the same way.
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
        ]}
      />
    </div>
  );
}
