// Confirmed live 2026-07-24 (a later regenerate attempt on this same workspace finally cleared
// the fabrication guard) — matches this shape exactly, field for field.
export interface CoverLetter {
  id: string;
  workspaceId: string;
  version: number;
  tone: "professional" | "friendly" | "confident" | "enthusiastic";
  length: "short" | "standard" | "long";
  content: string;
  wordCount: number;
  createdAt: string;
}

export interface RegenerateCoverLetterBody {
  tone: CoverLetter["tone"];
  length: CoverLetter["length"];
}
