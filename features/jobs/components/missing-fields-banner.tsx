"use client";

import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Body, Caption } from "@/components/ui/typography";
import { useUpdateJob } from "../hooks/use-update-job";
import type { JobDescription } from "../job.types";

// Soft nudge, not a hard block (per the FE integration guide): the pipeline already handles a
// missing company/position gracefully (research_company is skipped, the cover letter avoids
// fabricating a company, the run completes as 'partial' instead of 'completed') — this just lets
// the user fix it upfront, before paying for analysis, rather than being surprised by a degraded
// result after. Only meaningful once status === 'analyzed' (checked by the caller).
export function MissingFieldsBanner({ jd }: { jd: JobDescription }) {
  const [dismissed, setDismissed] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const update = useUpdateJob(jd.id);

  if (jd.missingFields.length === 0 || dismissed) return null;

  const needsCompany = jd.missingFields.includes("company");
  const needsPosition = jd.missingFields.includes("position");

  const hasAnyInput = (needsCompany && company.trim() !== "") || (needsPosition && position.trim() !== "");

  const submit = () => {
    const body: { company?: string; position?: string } = {};
    // Omission (not "") means "don't touch this field" — only send what the user actually typed.
    if (needsCompany && company.trim()) body.company = company.trim();
    if (needsPosition && position.trim()) body.position = position.trim();
    if (Object.keys(body).length === 0) return;
    update.mutate(body);
  };

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
      <div className="flex gap-3">
        <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Body className="text-ink">
              We couldn&apos;t find {[needsCompany && "a company name", needsPosition && "a position title"].filter(Boolean).join(" or ")} in this job posting.
            </Body>
            <Caption className="mt-0.5 block">
              Analysis will still run without it — it&apos;ll just skip company research and won&apos;t be able to name the employer in your cover letter.
            </Caption>
          </div>

          <div className="flex flex-wrap gap-2">
            {needsCompany && <Input placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} className="max-w-56" />}
            {needsPosition && <Input placeholder="Position title" value={position} onChange={(e) => setPosition(e.target.value)} className="max-w-56" />}
            <Button size="sm" onClick={submit} loading={update.isPending} disabled={!hasAnyInput}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              Skip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
