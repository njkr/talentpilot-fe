import { Body, Caption } from "@/components/ui/typography";
import type {
  ResumeSection,
  PersonalInfoContent,
  SummaryContent,
  SkillsContent,
  ExperienceItem,
  EducationItem,
  CertificationItem,
} from "../resume.types";

// Render exactly the captured shapes — never assume a field name the API doc / a live call
// hasn't confirmed. `projects` and `languages` fall through to the generic renderer below because
// neither has ever been observed populated (a prior guess for `education` turned out wrong in
// exactly this situation, so guessing their shape isn't worth the risk of silently misrendering).
export function SectionView({ section }: { section: ResumeSection }) {
  if (Array.isArray(section.content) && section.content.length === 0) {
    return <Caption>Nothing found in this section.</Caption>;
  }

  switch (section.sectionType) {
    case "personal_info": {
      const c = section.content as PersonalInfoContent;
      return (
        <div className="space-y-1 text-sm text-ink-secondary">
          <p className="font-medium text-ink">{c.fullName}</p>
          <p>{[c.email, c.phone, c.location].filter(Boolean).join(" · ")}</p>
          {c.links?.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-primary block">
              {l.label}
            </a>
          ))}
        </div>
      );
    }

    case "summary":
      return <Body>{(section.content as SummaryContent).text}</Body>;

    case "skills":
      return (
        <div className="flex flex-wrap gap-2">
          {(section.content as SkillsContent).map((s) => (
            <span key={s} className="rounded-md bg-bg px-2.5 py-1 text-xs font-medium text-ink">
              {s}
            </span>
          ))}
        </div>
      );

    case "experience":
      return (
        <div className="space-y-4">
          {(section.content as ExperienceItem[]).map((exp, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-medium text-ink">
                  {exp.title}, {exp.company}
                </p>
                <Caption className="shrink-0">
                  {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                </Caption>
              </div>
              <ul className="mt-1 space-y-1">
                {exp.highlights.map((h, j) => (
                  <li key={j} className="text-sm text-ink-secondary flex gap-2">
                    <span className="text-ink-muted">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "education":
      return (
        <div className="space-y-3">
          {(section.content as EducationItem[]).map((ed, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  {ed.degree}
                  {ed.field ? `, ${ed.field}` : ""}
                </p>
                <p className="text-sm text-ink-secondary">{ed.institution}</p>
              </div>
              <Caption className="shrink-0">
                {ed.startDate} – {ed.endDate}
              </Caption>
            </div>
          ))}
        </div>
      );

    case "certifications":
      return (
        <div className="space-y-2">
          {(section.content as CertificationItem[]).map((cert, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-ink">
                {cert.name} <span className="text-ink-secondary">— {cert.issuer}</span>
              </p>
              <Caption className="shrink-0">{cert.date}</Caption>
            </div>
          ))}
        </div>
      );

    default:
      return <GenericContent content={section.content} />;
  }
}

// Fallback for shapes not yet confirmed against a real response (projects, languages) or any
// future section type the backend adds — renders each item's own keys instead of guessing names.
function GenericContent({ content }: { content: unknown }) {
  const items = Array.isArray(content) ? content : [content];
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        if (typeof item === "string") return <Body key={i}>{item}</Body>;
        if (item && typeof item === "object") {
          return (
            <div key={i} className="text-sm text-ink-secondary space-y-0.5">
              {Object.entries(item as Record<string, unknown>)
                .filter(([, v]) => v != null && v !== "")
                .map(([k, v]) => (
                  <p key={k}>
                    <span className="text-ink-muted">{humanize(k)}: </span>
                    {Array.isArray(v) ? v.join(", ") : String(v)}
                  </p>
                ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

const humanize = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
