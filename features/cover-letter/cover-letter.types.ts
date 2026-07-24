// ⚠️ UNCONFIRMED LIVE: every real regenerate attempt in this account (3 in a row) hit the
// fabrication/placeholder guard and returned AI_OUTPUT_INVALID — a genuinely successful response
// was never observed. This shape is the sprint doc's reasonable guess, not verified data. Update
// this the first time a real successful CoverLetter response is actually seen.
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
