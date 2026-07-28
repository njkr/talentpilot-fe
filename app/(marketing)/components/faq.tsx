import { ChevronDownIcon } from "@heroicons/react/24/outline";

// Exported for structured-data.tsx's FAQPage JSON-LD — one list feeds both the visible page and
// the schema, so they can never drift apart.
export const FAQ_ITEMS = [
  {
    q: "What is an ATS and why does it matter?",
    a: "An Applicant Tracking System (ATS) is software employers use to filter resumes before a human sees them. Most large companies use one. TalentPilot scores your resume the way an ATS does, so you can fix issues before applying.",
  },
  {
    q: "Does TalentPilot make up experience to boost my score?",
    a: "Never. Every AI suggestion is checked in code against your actual resume. We never invent metrics, employers, or credentials — anything you couldn't back up in an interview is removed automatically before you ever see it.",
  },
  {
    q: "Is TalentPilot free?",
    a: "Yes, you can start free — no credit card required. Paid plans unlock more monthly credits for people running multiple applications at once.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "A general-purpose chatbot will happily invent a fake achievement to make your resume sound better. TalentPilot won't — and it gives you a real ATS score, keyword-level analysis, and a tailored cover letter grounded in your genuine experience.",
  },
  {
    q: "Will my resume be shared with anyone?",
    a: "No. Your resume and job descriptions are used only to generate your own analysis and suggestions — never shared, sold, or used to train a model on someone else's behalf.",
  },
] as const;

// No Radix Accordion needed (and none is installed) — a native <details>/<summary> keeps the
// answer text in the DOM at all times (required for the FAQ schema to be valid and for the text
// to be crawlable), needs zero client JS for the expand/collapse behavior itself, and the chevron
// rotation is pure CSS via the group-open: variant. This is a Server Component.
export function FAQ() {
  return (
    <section className="bg-card px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold text-ink">Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-border">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left marker:content-none">
                <span className="font-medium text-ink">{item.q}</span>
                <ChevronDownIcon
                  className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-150 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm text-ink-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
