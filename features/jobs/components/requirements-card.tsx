import { Card } from "@/components/ui/card";
import { H3, Caption } from "@/components/ui/typography";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import type { Importance, JobRequirement } from "../job.types";

const ORDER: Importance[] = ["required", "preferred", "nice_to_have"];

export function RequirementsCard({ requirements }: { requirements: JobRequirement[] }) {
  if (!requirements.length) {
    return (
      <Card>
        <H3 className="mb-2">Requirements</H3>
        <Caption>Nothing extracted from this posting.</Caption>
      </Card>
    );
  }

  // Group so required requirements read first — that's what the candidate must satisfy.
  const groups: Record<Importance, JobRequirement[]> = {
    required: requirements.filter((r) => r.importance === "required"),
    preferred: requirements.filter((r) => r.importance === "preferred"),
    nice_to_have: requirements.filter((r) => r.importance === "nice_to_have"),
  };

  return (
    <Card>
      <H3 className="mb-4">Requirements</H3>
      <div className="space-y-5">
        {ORDER.map((imp) =>
          groups[imp].length ? (
            <div key={imp}>
              <div className="mb-2 flex items-center gap-2">
                <ImportanceBadge importance={imp} />
                <Caption>{groups[imp].length}</Caption>
              </div>
              <ul className="space-y-1.5">
                {groups[imp].map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-secondary">
                    <span className="text-ink-muted mt-0.5">•</span>
                    {r.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
    </Card>
  );
}
