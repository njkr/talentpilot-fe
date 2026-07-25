// Confirmed live 2026-07-24 against a real workspace's interview questions — matches this shape
// exactly, field for field.
export interface InterviewQuestion {
  id: string;
  type: "hr" | "behavioral" | "technical" | "coding" | "system_design";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  idealAnswer: string;
  framework: string | null; // e.g. "STAR", or null
  whyAsked: string;
  basedOn: string | null; // the resume item / JD requirement that prompted it
  userAnswer: string | null;
  aiFeedback: string | null;
  answerScore: number | null; // 0-100
}
