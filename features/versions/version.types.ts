// Confirmed live 2026-07-23 against a resume with a real apply-created v2 and a real restore-
// created v3. The real shape omits `resumeId`/`workspaceId` that a first guess might include —
// only these fields actually come back.
export interface ResumeVersion {
  id: string;
  version: number;
  label: string; // e.g. "Optimised for Job — Sr. Fullstack Developer" or "Restored from v1"
  changeSummary: string;
  createdBy: "user" | "ai" | "restore";
  suggestionsApplied: number;
  createdAt: string;
  isSynthesized?: boolean; // our client-side v1 marker, not from the API
}

// Confirmed live: GET .../versions/diff returns this exact shape.
export interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
  count: number;
}
export interface SectionDiff {
  sectionType: string;
  changed: boolean;
  changes: DiffChange[];
}
