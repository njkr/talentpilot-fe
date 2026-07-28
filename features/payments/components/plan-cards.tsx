"use client";

import { useState } from "react";
import { ArrowUturnLeftIcon, ArrowUpCircleIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipGroup } from "@/components/ui/chip-group";
import { H3, Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { usePlans, useCheckout, useSwitchPlan, useClearPendingChange } from "../hooks/use-payments";
import type { Subscription, Plan, BillingInterval } from "../payment.types";

// Real, confirmed rank order — used only to label an action Upgrade vs Switch, not to sort (real
// `displayOrder` handles sort order).
const RANK: Record<string, number> = { free: 0, pro: 1, ultimate: 2 };

export function PlanCards({ subscription }: { subscription: Subscription }) {
  const { data: plans, isLoading } = usePlans();

  // No plan in this environment currently has a real yearly Stripe price (priceYearlyCents is 0
  // across the board, confirmed live) — showing a Yearly toggle would either display a fabricated
  // "$0/yr" or force every yearly click into a NOT_FOUND error. Only offer it once at least one
  // plan genuinely has one; this adapts automatically the moment an admin sets a real yearly price
  // via the Plan editor (Sprint "Configurable payments").
  const hasYearlyPricing = plans?.some((p) => p.priceYearlyCents > 0) ?? false;
  const [interval, setInterval] = useState<BillingInterval>("month");
  const effectiveInterval = hasYearlyPricing ? interval : "month";

  if (isLoading || !plans?.length) return null;

  const sorted = [...plans].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <H3>Plans</H3>
        {hasYearlyPricing && (
          <ChipGroup
            value={effectiveInterval}
            onChange={(v) => setInterval(v as BillingInterval)}
            options={[
              { value: "month", label: "Monthly" },
              { value: "year", label: "Yearly" },
            ]}
          />
        )}
      </div>
      <Caption className="mt-1 block">Exact pricing is shown on Stripe&apos;s checkout page before you pay.</Caption>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {sorted.map((plan) => (
          <PlanCard key={plan.id} plan={plan} interval={effectiveInterval} subscription={subscription} />
        ))}
      </div>
    </Card>
  );
}

function PlanCard({ plan, interval, subscription }: { plan: Plan; interval: BillingInterval; subscription: Subscription }) {
  const checkout = useCheckout();
  const switchPlan = useSwitchPlan();
  const clearPending = useClearPendingChange();

  const isCurrent = plan.key === subscription.planKey;
  const isFree = plan.key === "free";
  // An active OR past_due subscriber still has a real Stripe subscription to switch, not checkout
  // fresh — only `free`/`canceled` should ever reach checkout. This is the branch that prevents
  // the double-subscription bug the doc calls out; the backend's own ALREADY_SUBSCRIBED guard
  // (confirmed live) is the backstop if this ever gets it wrong.
  const hasActiveSub = subscription.planKey !== "free" && subscription.status !== "canceled";
  const isPendingTarget = plan.key === subscription.pendingPlanKey;
  const isUpgrade = RANK[plan.key] > RANK[subscription.planKey];
  const priceCents = interval === "month" ? plan.priceMonthlyCents : plan.priceYearlyCents;
  const pending = checkout.isPending || switchPlan.isPending;

  const handleAction = () => {
    if (hasActiveSub) {
      switchPlan.mutate({ planKey: plan.key, interval });
    } else {
      checkout.mutate({ planKey: plan.key, interval, idempotencyKey: crypto.randomUUID() });
    }
  };

  return (
    <div className={cn("flex flex-col rounded-xl border p-4", plan.key === "pro" ? "border-primary ring-1 ring-primary/20" : "border-border")}>
      <p className="font-semibold text-ink">{plan.name}</p>
      <p className="mt-1 text-2xl font-bold text-ink">
        ${(priceCents / 100).toFixed(0)}
        <span className="text-sm font-normal text-ink-secondary">/{interval === "month" ? "mo" : "yr"}</span>
      </p>
      <Caption className="mt-1 block">{plan.monthlyCredits} credits/mo</Caption>
      {plan.description && <Body className="mt-2 flex-1">{plan.description}</Body>}

      <div className="mt-4">
        {isCurrent && subscription.pendingPlanKey ? (
          // Confirmed live 2026-07-27: this card's plan IS what's currently in effect, but a
          // downgrade away from it is scheduled — offer the explicit undo here too (mirrors the
          // banner on CurrentPlanCard), routed through clearPendingChange rather than switching to
          // this same plan for clarity, even though the backend now allows both.
          <Button variant="secondary" icon={ArrowUturnLeftIcon} className="w-full" loading={clearPending.isPending} onClick={() => clearPending.mutate()}>
            Keep {plan.name}
          </Button>
        ) : isCurrent ? (
          <Button variant="secondary" disabled className="w-full">
            Current plan
          </Button>
        ) : isPendingTarget ? (
          <Button variant="secondary" disabled className="w-full">
            Scheduled
          </Button>
        ) : isFree ? (
          hasActiveSub ? (
            <Caption className="block py-2 text-center">Use &quot;Cancel subscription&quot; above to move to Free</Caption>
          ) : (
            <Button variant="secondary" disabled className="w-full">
              —
            </Button>
          )
        ) : (
          <Button className="w-full" icon={!hasActiveSub || isUpgrade ? ArrowUpCircleIcon : ArrowsRightLeftIcon} loading={pending} disabled={pending} onClick={handleAction}>
            {!hasActiveSub || isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
          </Button>
        )}
      </div>
    </div>
  );
}
