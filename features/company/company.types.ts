// Confirmed live 2026-07-24 against a real workspace's company insight — matches this shape
// exactly, field for field.
export interface CompanyInsight {
  id: string;
  workspaceId: string;
  runId: string;
  companyName: string;
  overview: string;
  culture: string[]; // can be an empty array
  talkingPoints: string[];
  sources: string[]; // URLs the synthesis was grounded in
  confidence: "low" | "medium" | "high"; // 'low' is HONEST, not an error
  fromCache: boolean;
  createdAt: string;
}
