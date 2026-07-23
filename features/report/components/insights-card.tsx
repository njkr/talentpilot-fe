import { CheckIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";
import type { AtsReport } from "../report.types";

export function InsightsCard({ report }: { report: AtsReport }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <H3 className="mb-3">Strengths</H3>
        <ul className="space-y-2">
          {report.strengths.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-secondary">
              <CheckIcon className="h-4 w-4 shrink-0 text-success mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <H3 className="mb-3">Gaps to address</H3>
        <ul className="space-y-2">
          {report.weaknesses.map((w, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-secondary">
              <MinusIcon className="h-4 w-4 shrink-0 text-warning mt-0.5" />
              {w}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="md:col-span-2">
        <H3 className="mb-3">Recommended actions</H3>
        <ol className="space-y-2">
          {report.recommendations.map((r, i) => (
            <li key={i} className="flex gap-3 text-sm text-ink-secondary">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
              {r}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
