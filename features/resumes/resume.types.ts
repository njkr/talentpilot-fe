// Status walk from the API doc §2.7-2.8, confirmed live. Exact string values the backend returns.
export type ResumeStatus = "uploaded" | "extracting" | "extracted" | "parsing" | "parsed" | "failed";

export interface Resume {
  id: string;
  title: string;
  status: ResumeStatus;
  pageCount: number | null;
  wordCount: number | null;
  fileSize: number;
  language: string | null;
  parseError: string | null;
  createdAt: string;
}

// Sections are polymorphic — `content` shape depends on `sectionType`.
export type SectionType = "personal_info" | "summary" | "skills" | "experience" | "projects" | "education" | "certifications" | "languages";

export interface ResumeSection {
  sectionType: SectionType;
  content: unknown; // typed per-section in the render layer
  orderIndex: number;
  confidence: number; // 0.0-1.0 — flag < 0.6 for review
  aiGenerated: boolean;
  editedByUser: boolean;
  updatedAt: string;
}

// terminal states — polling stops here
export const isTerminal = (s: ResumeStatus) => s === "parsed" || s === "failed";

// Content shapes confirmed 2026-07-22 against a real parsed resume + the Postman collection's
// saved examples. `projects` and `languages` have never been observed populated in either source
// (both came back as empty arrays live) — rendered generically in SectionView rather than guessed,
// since a prior guess (education) turned out to be wrong in exactly this situation.
export interface PersonalInfoContent {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  links: { url: string; label: string }[]; // never observed non-empty — item shape unconfirmed
}
export interface SummaryContent {
  text: string;
}
export type SkillsContent = string[];
export interface ExperienceItem {
  title: string;
  company: string;
  startDate: string;
  endDate: string; // literal "Present" for a current role, alongside isCurrent
  location: string | null;
  isCurrent: boolean;
  highlights: string[];
}
export interface EducationItem {
  degree: string;
  institution: string;
  field: string | null;
  startDate: string;
  endDate: string;
}
export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export const sectionLabels: Record<SectionType, string> = {
  personal_info: "Personal Info",
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
};
