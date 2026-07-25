// Confirmed live 2026-07-25 (POST /workspaces/:id/documents with a bad type echoes the real
// enum in VALIDATION_FAILED.fields.type): `full_report_pdf`, NOT `report_pdf` as the sprint doc's
// prose implied — the doc never actually wrote the literal type strings, only described them.
export type DocumentType = "resume_pdf" | "resume_docx" | "cover_letter_pdf" | "cover_letter_docx" | "full_report_pdf";

export type DocumentStatus = "queued" | "generating" | "ready" | "stale" | "failed";

// Real shape confirmed live + matches Postman examples exactly.
export interface GeneratedDocument {
  id: string;
  workspaceId: string;
  type: DocumentType;
  filename: string;
  status: DocumentStatus;
  fileSize: number | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  resume_pdf: "Resume (PDF)",
  resume_docx: "Resume (Word)",
  cover_letter_pdf: "Cover Letter (PDF)",
  cover_letter_docx: "Cover Letter (Word)",
  full_report_pdf: "Full report (PDF)",
};

export const DOCUMENT_TYPES: DocumentType[] = ["resume_pdf", "resume_docx", "cover_letter_pdf", "cover_letter_docx", "full_report_pdf"];

// `stale` is deliberately NOT terminal-as-usable — CLAUDE.md: "stale document = treat as not
// ready, regenerate." It IS terminal for polling purposes (stop polling), just not downloadable.
export const isPollTerminal = (doc: GeneratedDocument) => doc.status === "ready" || doc.status === "failed" || doc.status === "stale";
