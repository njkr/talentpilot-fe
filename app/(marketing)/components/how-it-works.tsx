const STEPS = [
  {
    n: 1,
    title: "Upload your resume & the job",
    desc: "Paste any job posting and drop in your resume. We parse both in seconds.",
  },
  {
    n: 2,
    title: "Get your ATS score",
    desc: "See exactly how you match — keyword by keyword — and what's missing.",
  },
  {
    n: 3,
    title: "Optimize & apply",
    desc:
      "Accept AI rewrites (checked in code against your real experience), get a cover letter, " +
      "and apply with confidence.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-card px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-ink">How TalentPilot works</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
