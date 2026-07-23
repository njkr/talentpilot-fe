import { Card } from "@/components/ui/card";
import { Body } from "@/components/ui/typography";
import { WorkspaceHeader } from "./workspace-header";
import type { Workspace } from "../workspace.types";

// Placeholder for a workspace that already has a completed/partial run. Sprint 6 replaces this
// with the real tabs: ATS score, keyword table, suggestions, versions, cover letter.
export function WorkspaceView({ workspace }: { workspace: Workspace }) {
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <Card>
        <Body>The full report view (score, keywords, suggestions) lands in Sprint 6.</Body>
      </Card>
    </div>
  );
}
