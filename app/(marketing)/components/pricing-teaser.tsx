import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicPlans } from "../lib/get-public-plans";

// Real, live plan data (GET /plans) — never hardcoded prices, which have already changed twice in
// this project's real history (see CLAUDE.md). If the backend is unreachable at build/request
// time, getPublicPlans() returns [] and this section quietly links to /pricing instead of
// rendering broken/fabricated numbers.
export async function PricingTeaser() {
  const plans = await getPublicPlans();
  const featured = plans.slice(0, 3);

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-ink">Simple, transparent pricing</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink-secondary">
          Start free. Upgrade only when you need more credits.
        </p>

        {featured.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {featured.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {plan.priceMonthlyCents === 0 ? "Free" : `$${(plan.priceMonthlyCents / 100).toFixed(2)}`}
                  {plan.priceMonthlyCents > 0 && <span className="text-sm font-normal text-ink-muted">/mo</span>}
                </p>
                {plan.description && <p className="mt-2 text-sm text-ink-secondary">{plan.description}</p>}
                <p className="mt-4 flex items-center gap-1.5 text-sm text-ink-secondary">
                  <CheckIcon className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  {plan.monthlyCredits} credits / month
                </p>
              </Card>
            ))}
          </div>
        ) : null}

        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See full pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
