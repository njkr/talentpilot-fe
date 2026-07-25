"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { H1, Body } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSubscription } from "@/features/payments/hooks/use-payments";
import { CurrentPlanCard } from "@/features/payments/components/current-plan-card";
import { UpgradePlans } from "@/features/payments/components/upgrade-plans";
import { CreditHistory } from "@/features/credits/components/credit-history";

// Bounded confirmation window after a Stripe Checkout redirect: the redirect itself grants
// nothing (CLAUDE.md/doc — only the webhook does), so this polls briefly rather than trusting the
// URL. If the webhook hasn't landed by then, stop polling rather than spin forever.
const CONFIRM_TIMEOUT_MS = 40000;

function BillingPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const justCheckedOut = searchParams.get("checkout") === "success";

  const [confirming, setConfirming] = useState(justCheckedOut);
  const { data: subscription, isLoading } = useSubscription(confirming);

  // `currentPeriodEnd` going non-null is the real, confirmed-live signal a paid subscription is
  // now active (free plan always has it null) — stop polling and drop the query param. setState
  // deferred into a setTimeout(…, 0) — React's set-state-in-effect rule flags a setState call made
  // synchronously in an effect body (see use-resume-status.ts/run-complete.tsx for the same idiom).
  useEffect(() => {
    if (!subscription?.currentPeriodEnd) return;
    const t = setTimeout(() => {
      setConfirming(false);
      router.replace("/billing");
    }, 0);
    return () => clearTimeout(t);
  }, [subscription, router]);

  // One-shot bail-out timer, independent of react-query's own refetch cadence — runs once per
  // mount, not re-armed on every poll tick.
  useEffect(() => {
    if (!justCheckedOut) return;
    const t = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [justCheckedOut]);

  return (
    <div className="space-y-6">
      <div>
        <H1>Billing</H1>
        <Body>Your plan, credits, and payment history.</Body>
      </div>

      {confirming && (
        <Card className="flex items-center gap-3 bg-primary/5 border-primary/20">
          <Spinner className="h-5 w-5 text-primary" />
          <Body>Confirming your upgrade — this can take a few seconds.</Body>
        </Card>
      )}
      {justCheckedOut && !confirming && !subscription?.currentPeriodEnd && (
        <Card className="bg-warning/5 border-warning/20">
          <Body>Still processing your upgrade. This can take a minute — refresh shortly, or check back later.</Body>
        </Card>
      )}

      {isLoading || !subscription ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <>
          <CurrentPlanCard subscription={subscription} />
          <UpgradePlans currentPlanKey={subscription.planKey} />
        </>
      )}

      <CreditHistory />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
      <BillingPageInner />
    </Suspense>
  );
}
