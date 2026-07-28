"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/error";
import { paymentApi } from "../payment.api";
import type { PlanKey } from "../payment.types";

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

export function useCheckout() {
  return useMutation({
    mutationFn: ({ planKey, idempotencyKey }: { planKey: PlanKey; idempotencyKey: string }) => paymentApi.checkout(planKey, idempotencyKey),
    onSuccess: ({ url }) => {
      window.location.href = url; // hand off to Stripe Checkout — card details never touch this app
    },
    onError: (err) => {
      if (!(err instanceof ApiError)) return;
      if (err.code === "NOT_FOUND") {
        toast("This plan isn't available for checkout right now.", "error");
        return;
      }
      toast(err.message, "error");
    },
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
