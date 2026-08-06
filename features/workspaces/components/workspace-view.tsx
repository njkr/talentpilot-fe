"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { ReportTab } from "@/features/report/components/report-tab";
import { SuggestionsTab } from "@/features/suggestions/components/suggestions-tab";
import { CoverLetterTab } from "@/features/cover-letter/components/cover-letter-tab";
import { InterviewTab } from "@/features/interview/components/interview-tab";
import { LearningTab } from "@/features/learning/components/learning-tab";
import { CompanyTab } from "@/features/company/components/company-tab";
import { SalaryTab } from "@/features/salary/components/salary-tab";
import { WorkspaceHeader } from "./workspace-header";
import type { Workspace } from "../workspace.types";

// There's no aggregate endpoint for a workspace's artifacts (report, suggestions, cover letter,
// ...) — each tab fetches lazily via its own `active` flag so an unopened tab never fires a
// request.
export function WorkspaceView({ workspace }: { workspace: Workspace }) {
  const [tab, setTab] = useState("report");

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />

      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          { value: "report", label: "ATS Report", content: <ReportTab workspaceId={workspace.id} resumeId={workspace.resumeId} active={tab === "report"} /> },
          { value: "suggestions", label: "Suggestions", content: <SuggestionsTab workspaceId={workspace.id} resumeId={workspace.resumeId} active={tab === "suggestions"} /> },
          { value: "cover-letter", label: "Cover Letter", content: <CoverLetterTab workspaceId={workspace.id} active={tab === "cover-letter"} /> },
          { value: "interview", label: "Interview", content: <InterviewTab workspaceId={workspace.id} active={tab === "interview"} /> },
          { value: "company", label: "Company", content: <CompanyTab workspaceId={workspace.id} active={tab === "company"} /> },
          { value: "salary", label: "Salary", content: <SalaryTab workspaceId={workspace.id} active={tab === "salary"} /> },
          { value: "learning", label: "Learning", content: <LearningTab workspaceId={workspace.id} active={tab === "learning"} /> },
        ]}
      />
    </div>
  );
}
