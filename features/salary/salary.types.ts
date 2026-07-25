// Confirmed live 2026-07-24 against a real workspace's salary estimate — matches this shape
// exactly, field for field.
export interface SalaryEstimate {
  id: string;
  workspaceId: string;
  runId: string;
  currency: string;
  p25: number;
  p50: number;
  p75: number;
  isEstimate: true; // ALWAYS true — never render this as a firm quote
  methodology: string;
  factors: string[];
  negotiationTips: string[];
  createdAt: string;
}
