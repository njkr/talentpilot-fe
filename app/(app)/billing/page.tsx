"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { H1, Body } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useSubscription } from "@/features/payments/hooks/use-payments";
import { CurrentPlanCard } from "@/features/payments/components/current-plan-card";
import { PlanCards } from "@/features/payments/components/plan-cards";
import { CreditPacks, PRE_PURCHASE_BALANCE_KEY } from "@/features/payments/components/credit-packs";
import { CreditHistory } from "@/features/credits/components/credit-history";
import { useCredits } from "@/features/credits/credits.hooks";

// Bounded confirmation window after a Stripe Checkout redirect: the redirect itself grants
// nothing (CLAUDE.md/doc — only the webhook does), so this polls briefly rather than trusting the
// URL. If the webhook hasn't landed by then, stop polling rather than spin forever.
const CONFIRM_TIMEOUT_MS = 40000;

function BillingPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const justCheckedOut = searchParams.get("checkout") === "success";
  const justBoughtCredits = searchParams.get("purchase") === "success";

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

  // Credit-pack purchase confirmation — same "redirect isn't trustworthy, the webhook is" rule as
  // the subscription flow above, but credits have no field like currentPeriodEnd to flip on
  // activation, so the pre-purchase balance (stashed in sessionStorage right before the Stripe
  // redirect by CreditPacks) is the terminal signal instead: poll until it's exceeded.
  const [preBalance] = useState<number | null>(() => {
    if (typeof window === "undefined" || !justBoughtCredits) return null;
    const v = sessionStorage.getItem(PRE_PURCHASE_BALANCE_KEY);
    return v ? Number(v) : null;
  });
  const [confirmingPurchase, setConfirmingPurchase] = useState(justBoughtCredits && preBalance !== null);
  const { data: credits } = useCredits(confirmingPurchase && preBalance !== null ? preBalance : undefined);

  useEffect(() => {
    if (!confirmingPurchase || preBalance === null || !credits || credits.balance <= preBalance) return;
    const t = setTimeout(() => {
      setConfirmingPurchase(false);
      sessionStorage.removeItem(PRE_PURCHASE_BALANCE_KEY);
      router.replace("/billing");
    }, 0);
    return () => clearTimeout(t);
  }, [credits, confirmingPurchase, preBalance, router]);

  useEffect(() => {
    if (!justBoughtCredits) return;
    const t = setTimeout(() => setConfirmingPurchase(false), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [justBoughtCredits]);

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

      {confirmingPurchase && (
        <Card className="flex items-center gap-3 bg-primary/5 border-primary/20">
          <Spinner className="h-5 w-5 text-primary" />
          <Body>Confirming your credit purchase — this can take a few seconds.</Body>
        </Card>
      )}
      {justBoughtCredits && !confirmingPurchase && preBalance !== null && (credits?.balance ?? 0) <= preBalance && (
        <Card className="bg-warning/5 border-warning/20">
          <Body>Still processing your purchase. This can take a minute — refresh shortly, or check back later.</Body>
        </Card>
      )}

      {isLoading || !subscription ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <>
          <CurrentPlanCard subscription={subscription} />
          <PlanCards subscription={subscription} />
        </>
      )}

      <CreditPacks />

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
