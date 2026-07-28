import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site-config";
import { getPublicPlans } from "../lib/get-public-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for TalentPilot's AI resume optimizer and ATS checker. Start free, " +
    "upgrade only when you need more credits.",
  alternates: { canonical: `${SITE_URL}/pricing` },
};

// Real, live plan data — see get-public-plans.ts's own doc comment for why this isn't the app's
// client `api` wrapper. Checkout itself requires an account, so every CTA here routes through
// /register rather than hitting the (authed) checkout endpoint directly.
export default async function PricingPage() {
  const plans = await getPublicPlans();
  const sorted = [...plans].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-secondary">
            Start free. Upgrade only when you need more credits — cancel any time.
          </p>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-16 text-center text-sm text-ink-secondary">
            Live pricing is temporarily unavailable — <Link href="/register" className="text-primary underline">sign up free</Link> to see current plans.
          </p>
        ) : (
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {sorted.map((plan, i) => {
              const featured = i === 1; // the middle tier, if there are 3+
              return (
                <Card
                  key={plan.id}
                  className={cn("flex flex-col", featured && "border-primary shadow-md ring-1 ring-primary")}
                >
                  {featured && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      Most popular
                    </span>
                  )}
                  <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
                  <p className="mt-2 text-3xl font-bold text-ink">
                    {plan.priceMonthlyCents === 0 ? "Free" : `$${(plan.priceMonthlyCents / 100).toFixed(2)}`}
                    {plan.priceMonthlyCents > 0 && <span className="text-sm font-normal text-ink-muted">/mo</span>}
                  </p>
                  {plan.description && <p className="mt-2 text-sm text-ink-secondary">{plan.description}</p>}

                  <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                    <PlanFeature>{plan.monthlyCredits} credits / month</PlanFeature>
                    <PlanFeature>
                      {plan.maxResumes < 0 ? "Unlimited resumes" : `Up to ${plan.maxResumes} resumes`}
                    </PlanFeature>
                    <PlanFeature>
                      {plan.maxWorkspaces < 0 ? "Unlimited workspaces" : `Up to ${plan.maxWorkspaces} workspaces`}
                    </PlanFeature>
                  </ul>

                  <Button asChild size="lg" className="mt-6" variant={featured ? "primary" : "secondary"}>
                    <Link href="/register">{plan.priceMonthlyCents === 0 ? "Start free" : "Get started"}</Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-ink-secondary">
      <CheckIcon className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
      {children}
    </li>
  );
}
