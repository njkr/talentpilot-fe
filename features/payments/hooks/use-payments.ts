"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/error";
import { paymentApi } from "../payment.api";
import type { PlanKey, BillingInterval } from "../payment.types";

// `pollUntilActive`: used only right after a Stripe Checkout redirect back (?checkout=success).
// The redirect itself is untrustworthy for granting access (CLAUDE.md/doc) — the real activation
// comes from Stripe's webhook, which can lag a few seconds behind the redirect. `currentPeriodEnd`
// is confirmed live to be null on the free plan and only ever set once a real (webhook-activated)
// paid subscription exists, so "it's no longer null" is a real, grounded terminal signal — not a
// guess about plan names changing.
export function useSubscription(pollUntilActive = false) {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: paymentApi.getSubscription,
    refetchInterval: pollUntilActive ? (query) => (query.state.data?.currentPeriodEnd ? false : 2000) : false,
  });
}

export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: paymentApi.listPlans });
}

export function useCheckout() {
  return useMutation({
    mutationFn: ({ planKey, interval, idempotencyKey }: { planKey: PlanKey; interval: BillingInterval; idempotencyKey: string }) =>
      paymentApi.checkout(planKey, interval, idempotencyKey),
    onSuccess: ({ url }) => {
      window.location.href = url; // hand off to Stripe Checkout — card details never touch this app
    },
    onError: (err) => {
      if (!(err instanceof ApiError)) return;
      if (err.code === "NOT_FOUND") {
        toast("This plan isn't available for checkout right now.", "error");
        return;
      }
      if (err.code === "ALREADY_SUBSCRIBED") {
        // Shouldn't be reachable from PlanCards (it routes existing subscribers to switch), but
        // the backend's own real backstop — surface it honestly rather than a generic message.
        toast("You already have an active subscription — use Switch instead.", "error");
        return;
      }
      toast(err.message, "error");
    },
  });
}

export function useSwitchPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planKey, interval }: { planKey: PlanKey; interval: BillingInterval }) => paymentApi.switchPlan(planKey, interval),
    onSuccess: (sub) => {
      qc.setQueryData(["subscription"], sub);
      qc.invalidateQueries({ queryKey: ["credits"] }); // an immediate upgrade grants the credit gap
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast(sub.pendingPlanKey ? `You'll switch to ${sub.pendingPlanKey} at your next renewal.` : `You're now on ${sub.planName}. Enjoy!`, "success");
    },
    onError: (err) => {
      if (!(err instanceof ApiError)) return;
      if (err.code === "NOT_FOUND") {
        toast("This plan isn't available right now.", "error");
        return;
      }
      // VALIDATION_FAILED's useful text lives inside `fields` here, not `message` — confirmed live
      // the backend's own "already on this plan" check returns `fields: {"You": ["..."]}`, an odd
      // shape but the only place the real explanation is.
      if (err.code === "VALIDATION_FAILED" && err.fields) {
        const firstMessage = Object.values(err.fields)[0]?.[0];
        toast(firstMessage ?? err.message, "error");
        return;
      }
      toast(err.message, "error");
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.cancel,
    onSuccess: (sub) => {
      qc.setQueryData(["subscription"], sub);
      toast("Your plan will end at the period close", "success");
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Couldn't cancel — try again", "error"),
  });
}

export function useResumeSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.resume,
    onSuccess: (sub) => {
      qc.setQueryData(["subscription"], sub);
      toast("Your plan will continue", "success");
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Couldn't resume — try again", "error"),
  });
}

export function useClearPendingChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.clearPendingChange,
    onSuccess: (sub) => {
      qc.setQueryData(["subscription"], sub);
      toast(`Your ${sub.planName} plan will continue — the scheduled change was cancelled.`, "success");
    },
    // Real code for "nothing pending" is NO_SUBSCRIPTION_TO_RESUME (shared with resume, not a
    // distinct NO_PENDING_CHANGE), confirmed live — its message is clear enough to show as-is,
    // shouldn't be reachable anyway since this only renders while pendingPlanKey is set.
    onError: (err) => toast(err instanceof ApiError ? err.message : "Couldn't undo the change — try again", "error"),
  });
}

export function usePortal() {
  return useMutation({
    mutationFn: paymentApi.portal,
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err) => {
      if (!(err instanceof ApiError)) return;
      if (err.code === "NOT_FOUND") {
        toast("You're on the free plan — there's no billing account to manage yet.", "default");
        return;
      }
      toast(err.message, "error");
    },
  });
}

export function useCreditPacks() {
  return useQuery({ queryKey: ["credit-packs"], queryFn: paymentApi.listCreditPacks });
}

export function useBuyCreditPack() {
  return useMutation({
    mutationFn: ({ packId, idempotencyKey }: { packId: string; idempotencyKey: string }) => paymentApi.buyCreditPack(packId, idempotencyKey),
    onSuccess: ({ url }) => {
      window.location.href = url; // hand off to Stripe Checkout, same as plan checkout
    },
    onError: (err) => {
      if (!(err instanceof ApiError)) return;
      if (err.code === "FEATURE_DISABLED") {
        toast("Credit packs aren't available right now.", "error");
        return;
      }
      if (err.code === "NOT_FOUND") {
        toast("This pack isn't available right now.", "error");
        return;
      }
      toast(err.message, "error");
    },
  });
}
