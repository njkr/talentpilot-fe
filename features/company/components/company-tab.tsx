"use client";

import { InformationCircleIcon, ChatBubbleLeftIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { H3, Body } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useCompanyInsight } from "../hooks/use-company-insight";
import type { CompanyInsight } from "../company.types";

export function CompanyTab({ workspaceId, active }: { workspaceId: string; active: boolean }) {
  const { data, isLoading, error } = useCompanyInsight(workspaceId, active);

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  // research_company is an OPTIONAL pipeline step — it can genuinely be absent if the research
  // provider was down during the run. That's a partial run, not a broken app.
  if (error || !data) return <EmptyState title="Company research unavailable" description="This step didn't complete during the analysis. You can retry the run to try again." />;

  return (
    <div className="space-y-4">
      {/* Low confidence = the company has little public footprint. Say so plainly — it's a
          truthful signal, and dressing it up as complete research would mislead the user into
          an interview with thin, uncertain talking points. */}
      {data.confidence === "low" && (
        <div className="flex gap-3 rounded-lg bg-warning/10 px-4 py-3">
          <InformationCircleIcon className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-warning">Limited public information</p>
            <p className="mt-0.5 text-sm text-ink-secondary">We found little about this company online. Treat the notes below as a starting point, and check the sources yourself before the interview.</p>
          </div>
        </div>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <H3>{data.companyName}</H3>
          <ConfidenceBadge confidence={data.confidence} />
        </div>
        <Body>{data.overview}</Body>
      </Card>

      {/* culture can be [] — render nothing rather than an empty heading. */}
      {data.culture.length > 0 && (
        <Card>
          <H3 className="mb-3">Culture signals</H3>
          <ul className="space-y-2">
            {data.culture.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-secondary">
                <span className="text-ink-muted">•</span>
                {c}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.talkingPoints.length > 0 && (
        <Card>
          <H3 className="mb-1">Talking points</H3>
          <Body className="mb-3">Specific things you can raise to show you did your homework.</Body>
          <ul className="space-y-2.5">
            {data.talkingPoints.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-secondary">
                <ChatBubbleLeftIcon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Sources are the transparency mechanism — the user can verify every claim. */}
      {data.sources.length > 0 && (
        <Card>
          <H3 className="mb-3">Sources</H3>
          <ul className="space-y-1.5">
            {data.sources.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                  {hostname(s)}
                  <ArrowTopRightOnSquareIcon className="ml-1 inline h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

const confidenceConfig: Record<CompanyInsight["confidence"], { label: string; className: string }> = {
  high: { label: "Well sourced", className: "bg-success/10 text-success" },
  medium: { label: "Moderate", className: "bg-primary/10 text-primary" },
  low: { label: "Limited data", className: "bg-warning/10 text-warning" },
};

function ConfidenceBadge({ confidence }: { confidence: CompanyInsight["confidence"] }) {
  const c = confidenceConfig[confidence];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", c.className)}>{c.label}</span>;
}

const hostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};
