"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { H3, Body, Caption } from "@/components/ui/typography";
import { useCheckout } from "../hooks/use-payments";
import type { PlanKey } from "../payment.types";

// Checkout only ever accepts `pro` or `ultimate` (confirmed live/Postman — `free` needs no
// checkout). There is no GET /plans catalog anywhere in this backend (confirmed three ways: live
// 404, absent from the 44-endpoint API reference, absent from the Postman collection), so there is
// no real source for what these plans cost or include beyond their own key — CLAUDE.md: never
// invent a field the API doesn't return. Rather than fabricate pricing/feature copy, this just
// offers the upgrade action directly; Stripe's own Checkout page is the one place real pricing is
// shown, immediately after clicking.
const UPGRADE_TARGETS: PlanKey[] = ["pro", "ultimate"];

export function UpgradePlans({ currentPlanKey }: { currentPlanKey: PlanKey }) {
  const checkout = useCheckout();
  const targets = UPGRADE_TARGETS.filter((k) => k !== currentPlanKey);

  if (targets.length === 0) {
    return (
      <Card>
        <H3>You&apos;re on our top plan</H3>
        <Body className="mt-1 text-ink-secondary">Ultimate already includes the highest credit and usage limits available.</Body>
      </Card>
    );
  }

  return (
    <Card>
      <H3>Upgrade</H3>
      <Caption className="mt-1">Exact pricing is shown on Stripe&apos;s checkout page before you pay.</Caption>
      <div className="mt-4 flex flex-wrap gap-3">
        {targets.map((planKey) => (
          <Button
            key={planKey}
            loading={checkout.isPending && checkout.variables?.planKey === planKey}
            disabled={checkout.isPending && checkout.variables?.planKey !== planKey}
            onClick={() => checkout.mutate({ planKey, idempotencyKey: crypto.randomUUID() })}
          >
            Upgrade to {titleCase(planKey)}
          </Button>
        ))}
      </div>
    </Card>
  );
}

const titleCase = (s: string) => s[0].toUpperCase() + s.slice(1);
