import { Card } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";

export function ResponsibilitiesCard({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <Card>
      <H3 className="mb-3">Responsibilities</H3>
      <ul className="space-y-1.5">
        {items.map((r, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink-secondary">
            <span className="text-ink-muted mt-0.5">•</span>
            {r}
          </li>
        ))}
      </ul>
    </Card>
  );
}
