import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";

// An illustrative preview of the real ATS score report UI — "the product IS the pitch." Static
// (no framer-motion / client JS) so this stays a Server Component; the ring in the real report
// (features/report/components/score-card.tsx) animates client-side, but a marketing preview
// doesn't need that interactivity to make the same point. Deliberately generic example content
// ("Senior Backend Engineer" / a placeholder company), not a real or implied customer's data.
const MATCHED = ["TypeScript", "React", "Node.js", "PostgreSQL", "REST APIs"];
const MISSING = ["Kubernetes", "GraphQL"];

export function ScoreDemo() {
  const score = 82;
  const circumference = 2 * Math.PI * 44;
  const filled = (score / 100) * circumference;

  return (
    <section className="bg-card px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-ink">See exactly where you stand</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink-secondary">
          A real ATS score report, not a black box — every matched and missing keyword, explained.
        </p>

        <Card className="mx-auto mt-10 max-w-2xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative h-28 w-28 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="44" fill="none" strokeWidth="8" className="stroke-border" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-primary"
                  strokeDasharray={`${filled} ${circumference}`}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-3xl font-bold text-primary">{score}</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-ink">Senior Backend Engineer</h3>
              <p className="mt-1 text-sm text-ink-secondary">Example report — illustrative, not a real applicant&apos;s data.</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-ink-muted">Matched</p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {MATCHED.map((k) => (
                      <li key={k} className="flex items-center gap-1.5 text-sm text-ink">
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-muted">Missing</p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {MISSING.map((k) => (
                      <li key={k} className="flex items-center gap-1.5 text-sm text-ink">
                        <XCircleIcon className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
