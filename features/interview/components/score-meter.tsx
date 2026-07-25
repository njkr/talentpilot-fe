import { cn } from "@/lib/utils";

// A small inline gauge, not a big verdict — the score is a coach's note, not a pass/fail gate.
export function ScoreMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full", score >= 75 ? "bg-success" : score >= 50 ? "bg-primary" : "bg-warning")} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-ink-secondary">{score}/100</span>
    </div>
  );
}
