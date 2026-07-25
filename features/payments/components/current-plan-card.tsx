"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H2, Body, Caption } from "@/components/ui/typography";
import { timeAgo } from "@/lib/utils";
import { usePortal } from "../hooks/use-payments";
import type { Subscription } from "../payment.types";

export function CurrentPlanCard({ subscription }: { subscription: Subscription }) {
  const portal = usePortal();
  const isFree = subscription.planKey === "free";

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <Caption>Current plan</Caption>
          <H2 className="mt-1">{subscription.planName}</H2>
        </div>
        <StatusTone status={subscription.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat label="Monthly credits" value={subscription.monthlyCredits} />
        <Stat label="Resumes" value={subscription.maxResumes} />
        <Stat label="Workspaces" value={subscription.maxWorkspaces} />
      </div>

      {subscription.currentPeriodEnd && (
        <Body className="mt-4 text-ink-secondary">
          {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"} {timeAgo(subscription.currentPeriodEnd)}.
        </Body>
      )}

      {/* Portal reliably 404s for a free-plan user (no Stripe customer yet) — don't invite a
          click that can only ever fail. */}
      {!isFree && (
        <Button variant="secondary" size="sm" className="mt-4" loading={portal.isPending} onClick={() => portal.mutate()}>
          Manage billing
        </Button>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <Caption>{label}</Caption>
    </div>
  );
}

function StatusTone({ status }: { status: string }) {
  const tone = status === "active" ? "success" : status === "past_due" ? "warning" : status === "canceled" ? "danger" : "neutral";
  return <Badge tone={tone}>{status.replace(/_/g, " ")}</Badge>;
}
