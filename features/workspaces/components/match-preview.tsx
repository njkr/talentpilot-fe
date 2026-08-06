"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Caption } from "@/components/ui/typography";
import { MatchGauge } from "@/components/ui/match-gauge";
import { useMatchPreview } from "../hooks/use-match-preview";
import { classifyMatchCoverage } from "../match.utils";

export function MatchPreview({ resumeId, jobDescriptionId }: { resumeId: string | null; jobDescriptionId: string | null }) {
  const { data, isLoading, isError } = useMatchPreview(resumeId, jobDescriptionId);

  if (!resumeId || !jobDescriptionId) return null;
  if (isLoading) return <Skeleton className="h-32 rounded-xl" />;
  // A failed preview is an enhancement lost, not a reason to block creating the workspace.
  if (isError || !data) return <Caption className="block">Match preview unavailable.</Caption>;

  const { requiredMatched, requiredTotal, missingRequiredKeywords } = data.coverage;
  const band = classifyMatchCoverage(data.coverage);
  const ratio = requiredTotal > 0 ? requiredMatched / requiredTotal : 1;

  return (
    <Card className="p-4">
      <MatchGauge ratio={ratio} band={band} label={`${requiredMatched} of ${requiredTotal} required skills matched`} />
      {band === "low" && missingRequiredKeywords.length > 0 && (
        <Caption className="mt-2 block text-center">
          Missing: {missingRequiredKeywords.slice(0, 5).join(", ")}
          {missingRequiredKeywords.length > 5 ? ` (+${missingRequiredKeywords.length - 5} more)` : ""}
        </Caption>
      )}
    </Card>
  );
}
