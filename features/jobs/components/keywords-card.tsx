import { Card } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";

export function KeywordsCard({ keywords }: { keywords: string[] }) {
  if (!keywords.length) return null;
  return (
    <Card>
      <H3 className="mb-3">Keywords</H3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <span key={k} className="rounded-md bg-bg px-2.5 py-1 text-xs font-medium text-ink-secondary">
            {k}
          </span>
        ))}
      </div>
    </Card>
  );
}
