"use client";

import { useState } from "react";
import { CreditCardIcon, NoSymbolIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { H2, Body, Caption } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";
import { usePortal, useCancelSubscription, useResumeSubscription, useClearPendingChange } from "../hooks/use-payments";
import type { Subscription } from "../payment.types";

export function CurrentPlanCard({ subscription }: { subscription: Subscription }) {
  const portal = usePortal();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();
  const clearPending = useClearPendingChange();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isFree = subscription.planKey === "free";

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <Caption>Current plan</Caption>
          <H2 className="mt-1">{subscription.planName}</H2>
          <DateLine subscription={subscription} />
        </div>
        <StatusTone status={subscription.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat label="Monthly credits" value={subscription.monthlyCredits} />
        <Stat label="Resumes" value={subscription.maxResumes} />
        <Stat label="Workspaces" value={subscription.maxWorkspaces} />
      </div>

      {/* past_due — warn, don't lock out. Stripe is still retrying the card. */}
      {subscription.status === "past_due" && (
        <div className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">We couldn&apos;t process your last payment. Update your card to keep your plan.</div>
      )}

      {/* Scheduled cancel → the churn-saver undo action. */}
      {subscription.cancelAtPeriodEnd && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          <span>
            Your plan ends {formatDate(subscription.currentPeriodEnd)}. You&apos;ll move to Free after that.
          </span>
          <Button size="sm" variant="secondary" icon={ArrowUturnLeftIcon} loading={resume.isPending} onClick={() => resume.mutate()}>
            Keep my plan
          </Button>
        </div>
      )}

      {/* Scheduled downgrade → say what changes, when, and offer the undo. Confirmed live
          2026-07-27: undoing this is a real, working action now (POST
          .../subscription/clear-pending-change) — previously a dead end. */}
      {subscription.pendingPlanKey && !subscription.cancelAtPeriodEnd && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-ink-secondary">
          <span>
            Changes to the <span className="font-medium capitalize text-ink">{subscription.pendingPlanKey}</span> plan on {formatDate(subscription.currentPeriodEnd)}. You
            keep your current benefits until then.
          </span>
          <Button size="sm" variant="secondary" icon={ArrowUturnLeftIcon} loading={clearPending.isPending} onClick={() => clearPending.mutate()}>
            Keep {subscription.planName}
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
        {/* Portal reliably 404s for a free-plan user (no Stripe customer yet) — don't invite a
            click that can only ever fail. */}
        {!isFree && (
          <Button variant="secondary" size="sm" icon={CreditCardIcon} loading={portal.isPending} onClick={() => portal.mutate()}>
            Manage billing
          </Button>
        )}

        {/* Cancel — only for a paid plan not already scheduled to cancel. No longer disabled while
            a downgrade is pending: confirmed live 2026-07-27 that the underlying 500 bug (see
            DEVELOPMENT-NOTES.md's "Billing: cancel / switch / packs" section) is fixed — cancelling now works
            in every state and clears any pending change too. */}
        {!isFree && !subscription.cancelAtPeriodEnd && (
          <Button variant="ghost" size="sm" icon={NoSymbolIcon} onClick={() => setConfirmCancel(true)} className="text-ink-secondary hover:text-danger">
            Cancel subscription
          </Button>
        )}
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel your subscription?">
        <div className="space-y-4">
          <Body>
            You&apos;ll keep your <span className="font-medium capitalize text-ink">{subscription.planKey}</span> plan and all its benefits until{" "}
            <span className="font-medium text-ink">{formatDate(subscription.currentPeriodEnd)}</span>. After that you&apos;ll move to the Free plan. You won&apos;t be
            charged again.
          </Body>
          {/* Confirmed live: cancelling while a downgrade is pending clears the pending change too. */}
          {subscription.pendingPlanKey && (
            <Body>Your scheduled change to {subscription.pendingPlanKey} will also be cancelled.</Body>
          )}
          <Body>You can undo this any time before then.</Body>
          <div className="flex gap-2">
            <Button variant="danger" icon={NoSymbolIcon} loading={cancel.isPending} onClick={() => cancel.mutate(undefined, { onSuccess: () => setConfirmCancel(false) })}>
              Cancel subscription
            </Button>
            <Button variant="ghost" icon={ArrowUturnLeftIcon} onClick={() => setConfirmCancel(false)}>
              Keep my plan
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Three distinct states, phrased so the label always matches reality — "Renews [date]" right after
// a cancel would be alarming and wrong; "Access ends [date]" is honest and reassuring (they keep it
// until then).
function DateLine({ subscription: sub }: { subscription: Subscription }) {
  if (sub.planKey === "free") return <Caption className="mt-1 block">No active subscription</Caption>;
  if (!sub.currentPeriodEnd) return null;
  if (sub.cancelAtPeriodEnd) return <Caption className="mt-1 block text-warning">Access ends {formatDate(sub.currentPeriodEnd)}</Caption>;
  if (sub.pendingPlanKey) return <Caption className="mt-1 block">Renews {formatDate(sub.currentPeriodEnd)} as {sub.pendingPlanKey}</Caption>;
  return <Caption className="mt-1 block">Renews {formatDate(sub.currentPeriodEnd)}</Caption>;
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
