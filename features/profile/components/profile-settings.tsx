"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Caption } from "@/components/ui/typography";
import { applyFieldErrors } from "@/features/auth/apply-field-errors";
import { useProfile, useUpdateProfile } from "../hooks/use-profile";
import type { Profile, ProfileUpdate } from "../profile.types";

// Confirmed live 2026-07-25: the backend validates linkedin/github as well-formed URLs
// (VALIDATION_FAILED: "linkedin must be a URL address" for a non-URL string), but NOT against
// their real hosts — a plain https://notlinkedin.com/x URL was accepted and saved as-is. This
// mirrors only what's actually enforced server-side; it does not claim host-specific validation
// the backend doesn't have.
// Number fields stay as plain strings at the schema level (an <input type="number"> still yields
// a string via register()) and are range-checked with refine — z.coerce.number() here produces an
// input/output type mismatch zodResolver can't reconcile with an `.or(z.literal(''))` fallback.
// Actual numeric conversion happens once, in toUpdateBody, right before the request goes out.
const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  targetRole: z.string().optional(),
  yearsExperience: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 60), "Must be between 0 and 60"),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  salaryExpectation: z
    .string()
    .optional()
    .refine((v) => !v || Number(v) >= 0, "Must be 0 or more"),
  salaryCurrency: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(profile: Profile): FormValues {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    phone: profile.phone ?? "",
    targetRole: profile.targetRole ?? "",
    yearsExperience: profile.yearsExperience === null ? "" : String(profile.yearsExperience),
    linkedin: profile.linkedin ?? "",
    github: profile.github ?? "",
    portfolio: profile.portfolio ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
    timezone: profile.timezone ?? "",
    salaryExpectation: profile.salaryExpectation === null ? "" : String(profile.salaryExpectation),
    salaryCurrency: profile.salaryCurrency ?? "",
  };
}

// Empty strings are meaningful client-side (an emptied field) but PUT is an upsert that leaves
// omitted fields untouched — so an emptied field still needs to be SENT (as "") to actually clear
// it server-side, not dropped from the body. Only truly untouched form fields stay omitted.
function toUpdateBody(values: FormValues): ProfileUpdate {
  const body: ProfileUpdate = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    (body as Record<string, unknown>)[key] = value === "" ? "" : (key === "yearsExperience" || key === "salaryExpectation") ? Number(value) : value;
  }
  return body;
}

export function ProfileSettings() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Sync the form once the profile first loads. `reset()` mutates react-hook-form's own external
  // store, not React state, so it's a real effect (not the "adjust state during render" pattern
  // used elsewhere in this codebase for pure derived state) — it has to live in useEffect. Guarded
  // by `hasSynced` rather than re-running on every `profile` object change, since a background
  // refetch (e.g. window refocus) would otherwise silently wipe in-progress unsaved edits.
  const [hasSynced, setHasSynced] = useState(false);
  useEffect(() => {
    if (!profile || hasSynced) return;
    reset(toFormValues(profile));
    const t = setTimeout(() => setHasSynced(true), 0);
    return () => clearTimeout(t);
  }, [profile, hasSynced, reset]);

  if (isLoading || !profile) return <Skeleton className="h-96 rounded-xl" />;

  const onSubmit = (values: FormValues) =>
    update.mutate(toUpdateBody(values), {
      onSuccess: (updated) => reset(toFormValues(updated)), // re-baseline so isDirty clears after a real save
      onError: (err) => applyFieldErrors(err, setError),
    });

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <H3>Profile strength</H3>
          <span className="text-sm font-medium text-primary">{profile.completeness}%</span>
        </div>
        <Progress value={profile.completeness} />
        {profile.completeness < 100 && <Caption className="mt-2 block">A complete profile gives the AI more context for tailoring your applications.</Caption>}
      </Card>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" {...register("firstName")} error={errors.firstName?.message} />
            <Input label="Last name" {...register("lastName")} error={errors.lastName?.message} />
          </div>
          <Input label="Target role" placeholder="Senior Backend Engineer" {...register("targetRole")} error={errors.targetRole?.message} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Years of experience" type="number" {...register("yearsExperience")} error={errors.yearsExperience?.message} />
            <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
          </div>
          <Input label="LinkedIn" placeholder="https://linkedin.com/in/…" {...register("linkedin")} error={errors.linkedin?.message} />
          <Input label="GitHub" placeholder="https://github.com/…" {...register("github")} error={errors.github?.message} />
          <Input label="Portfolio" placeholder="https://…" {...register("portfolio")} error={errors.portfolio?.message} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="City" {...register("city")} error={errors.city?.message} />
            <Input label="Country" {...register("country")} error={errors.country?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Timezone" placeholder="America/Los_Angeles" {...register("timezone")} error={errors.timezone?.message} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Salary expectation" type="number" {...register("salaryExpectation")} error={errors.salaryExpectation?.message} />
              <Input label="Currency" placeholder="USD" {...register("salaryCurrency")} error={errors.salaryCurrency?.message} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={update.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
