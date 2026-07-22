import { Card } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { JobSkill } from "../job.types";

export function SkillsCard({ skills }: { skills: JobSkill[] }) {
  if (!skills.length) return null;
  return (
    <Card>
      <H3 className="mb-3">Skills</H3>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s.name} className={cn("rounded-md px-2.5 py-1 text-xs font-medium", s.importance === "required" ? "bg-danger/10 text-danger" : "bg-bg text-ink-secondary")}>
            {s.name}
          </span>
        ))}
      </div>
    </Card>
  );
}
