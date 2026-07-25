import { Caption } from "@/components/ui/typography";

// Pad the visual band beyond p25/p75 so the markers aren't flush against the edges.
export function SalaryRange({ p25, p50, p75, currency }: { p25: number; p50: number; p75: number; currency: string }) {
  const span = p75 - p25;
  const min = p25 - span * 0.25;
  const max = p75 + span * 0.25;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-center gap-2">
        <span className="text-3xl font-bold text-ink">{money(p50, currency)}</span>
        <Caption>median</Caption>
      </div>

      <div className="relative h-2 rounded-full bg-bg">
        {/* The p25-p75 band — where most offers land. */}
        <div className="absolute h-full rounded-full bg-primary/25" style={{ left: `${pct(p25)}%`, right: `${100 - pct(p75)}%` }} />
        {/* The median marker */}
        <div className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${pct(p50)}%` }} />
      </div>

      <div className="mt-3 flex justify-between">
        <div>
          <Caption>25th</Caption>
          <p className="text-sm font-medium text-ink">{money(p25, currency)}</p>
        </div>
        <div className="text-right">
          <Caption>75th</Caption>
          <p className="text-sm font-medium text-ink">{money(p75, currency)}</p>
        </div>
      </div>
    </div>
  );
}

// Never hardcode $ — the backend returns the currency code, and a EUR/GBP estimate rendered with
// a dollar sign is actively misleading.
const money = (n: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
