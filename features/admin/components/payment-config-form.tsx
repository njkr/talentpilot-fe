"use client";

import { Controller, useForm } from "react-hook-form";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { H1, H3, Caption } from "@/components/ui/typography";
import { useAdminPaymentConfig, useUpdatePaymentConfig } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { PaymentConfig } from "../admin.types";

interface FormValues {
  analyzeCost: string;
  coverLetterRegenCost: string;
  interviewFeedbackCost: string;
  signupCreditGrant: string;
  referrerReward: string;
  refereeReward: string;
  referralQualifyingEvent: string;
  maxReferralRewardsPerUser: string;
  referralsEnabled: boolean;
  creditPacksEnabled: boolean;
}

function toFormValues(c: PaymentConfig): FormValues {
  return {
    analyzeCost: String(c.analyzeCost),
    coverLetterRegenCost: String(c.coverLetterRegenCost),
    interviewFeedbackCost: String(c.interviewFeedbackCost),
    signupCreditGrant: String(c.signupCreditGrant),
    referrerReward: String(c.referrerReward),
    refereeReward: String(c.refereeReward),
    referralQualifyingEvent: c.referralQualifyingEvent,
    maxReferralRewardsPerUser: String(c.maxReferralRewardsPerUser),
    referralsEnabled: c.referralsEnabled,
    creditPacksEnabled: c.creditPacksEnabled,
  };
}

// Real values confirmed live 2026-07-26 — "first_analysis" is the actual default in this env,
// matching the doc's own "(recommended)" framing.
const QUALIFYING_EVENT_OPTIONS = [
  { value: "signup", label: "Signup (highest abuse risk)" },
  { value: "email_verified", label: "Email verified" },
  { value: "first_analysis", label: "First analysis (recommended)" },
  { value: "first_payment", label: "First payment (most conservative)" },
];

export function PaymentConfigForm() {
  const { data: config, isLoading, error } = useAdminPaymentConfig();

  return (
    <AdminQueryBoundary error={error}>
      {isLoading || !config ? <Skeleton className="h-96 rounded-xl" /> : <PaymentConfigFields config={config} />}
    </AdminQueryBoundary>
  );
}

// Mounted only once `config` is loaded, so useForm's defaultValues are the REAL values from the
// very first render — no async reset() needed for the initial load. Confirmed live this matters:
// Controller-wrapped Select/Switch (controlled components) mounting with placeholder defaults and
// getting reset() to the real values in a later effect left the Select's Radix-rendered value
// visibly stuck blank (and every option showing aria-selected="false") even though reset() was
// provably called with the correct data — register()'d plain inputs update fine post-mount, but
// this Controller-based reset-after-mount path did not. Mounting fresh with the right
// defaultValues from the start (same pattern PromptManagement and the Plan/Pack editor dialogs
// already use successfully) sidesteps the bug entirely instead of chasing it.
function PaymentConfigFields({ config }: { config: PaymentConfig }) {
  const update = useUpdatePaymentConfig();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm<FormValues>({ defaultValues: toFormValues(config) });

  const onSubmit = (values: FormValues) => {
    const body: Partial<PaymentConfig> = {
      analyzeCost: Number(values.analyzeCost),
      coverLetterRegenCost: Number(values.coverLetterRegenCost),
      interviewFeedbackCost: Number(values.interviewFeedbackCost),
      signupCreditGrant: Number(values.signupCreditGrant),
      referrerReward: Number(values.referrerReward),
      refereeReward: Number(values.refereeReward),
      referralQualifyingEvent: values.referralQualifyingEvent,
      maxReferralRewardsPerUser: Number(values.maxReferralRewardsPerUser),
      referralsEnabled: values.referralsEnabled,
      creditPacksEnabled: values.creditPacksEnabled,
    };
    // Re-baseline after a real save so isDirty clears — this reset() call is fine (unlike the
    // initial-mount case above) since the form has been interactive for a while by now and every
    // Controller field is already fully registered.
    update.mutate(body, { onSuccess: (updated) => reset(toFormValues(updated)) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-6">
      <H1>Payment configuration</H1>
      <Caption className="-mt-4 block">Reads are cached 60s — your own next read after saving is always fresh, other in-flight requests can lag up to a minute.</Caption>

      <Card>
        <H3 className="mb-4">Action costs (credits)</H3>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Full analysis" type="number" {...register("analyzeCost")} />
          <Input label="Cover letter" type="number" {...register("coverLetterRegenCost")} />
          <Input label="Interview feedback" type="number" {...register("interviewFeedbackCost")} />
        </div>
      </Card>

      <Card>
        <H3 className="mb-4">Signup & referrals</H3>
        <div className="space-y-4">
          <Input label="Signup grant (credits)" type="number" {...register("signupCreditGrant")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Referrer reward" type="number" {...register("referrerReward")} />
            <Input label="Referee bonus" type="number" {...register("refereeReward")} />
          </div>
          <div>
            <Controller
              control={control}
              name="referralQualifyingEvent"
              render={({ field }) => <Select label="Reward triggers on" value={field.value} onValueChange={field.onChange} options={QUALIFYING_EVENT_OPTIONS} />}
            />
          </div>
          <Input label="Max rewards per user" type="number" helper="Caps how many referrals one user can be paid for" {...register("maxReferralRewardsPerUser")} />
        </div>
      </Card>

      <Card>
        <H3 className="mb-4">Feature flags</H3>
        <div className="space-y-3">
          <Controller
            control={control}
            name="referralsEnabled"
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink">Referrals enabled</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Referrals enabled" />
              </div>
            )}
          />
          <Controller
            control={control}
            name="creditPacksEnabled"
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink">Credit packs enabled</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Credit packs enabled" />
              </div>
            )}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" icon={CheckIcon} loading={update.isPending} disabled={!isDirty}>
          Save configuration
        </Button>
      </div>
    </form>
  );
}
