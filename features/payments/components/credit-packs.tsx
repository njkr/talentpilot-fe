"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { H3, Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useCreditPacks, useBuyCreditPack } from "../hooks/use-payments";
import { useCredits } from "@/features/credits/credits.hooks";

// sessionStorage key the billing page reads back after the Stripe redirect to know what the
// balance was BEFORE this purchase, since there's no other terminal signal (unlike subscription's
// currentPeriodEnd) to know a webhook-granted top-up has landed.
export const PRE_PURCHASE_BALANCE_KEY = "tp_credits_before_purchase";

export function CreditPacks() {
  const { data: packs } = useCreditPacks();
  const { data: credits } = useCredits();
  const buy = useBuyCreditPack();

  if (!packs?.length) return null; // feature disabled or none configured — confirmed live this can be an empty array

  const handleBuy = (packId: string) => {
    if (credits) sessionStorage.setItem(PRE_PURCHASE_BALANCE_KEY, String(credits.balance));
    buy.mutate({ packId, idempotencyKey: crypto.randomUUID() });
  };

  return (
    <Card>
      <H3 className="mb-1">Need more credits?</H3>
      <Body className="mb-4">Top up any time — credits never expire.</Body>

      <div className="grid gap-3 sm:grid-cols-3">
        {packs.map((pack) => (
          <div key={pack.id} className={cn("rounded-xl border p-4 text-center", pack.bestValue ? "border-primary ring-1 ring-primary/20" : "border-border")}>
            {pack.bestValue && <span className="mb-2 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Best value</span>}
            <p className="text-2xl font-bold text-ink">{pack.credits}</p>
            <Caption>credits</Caption>
            <p className="mt-2 text-lg font-semibold text-ink">${(pack.priceCents / 100).toFixed(2)}</p>
            <Button
              className="mt-3 w-full"
              size="sm"
              icon={ShoppingCartIcon}
              loading={buy.isPending && buy.variables?.packId === pack.id}
              disabled={buy.isPending}
              onClick={() => handleBuy(pack.id)}
            >
              Buy
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
