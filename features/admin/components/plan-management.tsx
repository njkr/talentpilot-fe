"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InformationCircleIcon, PlusIcon, PencilIcon, NoSymbolIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { H1, H3, Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/error";
import { useAdminPlans, useSavePlan, useArchivePlan } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { AdminPlan } from "../admin.types";

// Dollar strings in the form, converted to cents only right before the request — same pattern as
// profile-settings.tsx's toUpdateBody, avoids a custom input that fights react-hook-form's
// register() by hijacking onChange.
const schema = z.object({
  key: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  priceMonthlyDollars: z.string().refine((v) => v !== "" && !Number.isNaN(Number(v)), "Enter a number"),
  priceYearlyDollars: z.string().refine((v) => v !== "" && !Number.isNaN(Number(v)), "Enter a number"),
  monthlyCredits: z.string().refine((v) => v !== "" && Number.isInteger(Number(v)), "Enter a whole number"),
  maxResumes: z.string().refine((v) => v !== "" && Number.isInteger(Number(v)), "Enter a whole number (-1 = unlimited)"),
  maxWorkspaces: z.string().refine((v) => v !== "" && Number.isInteger(Number(v)), "Enter a whole number (-1 = unlimited)"),
  regenPerDay: z.string().refine((v) => v !== "" && Number.isInteger(Number(v)), "Enter a whole number (-1 = unlimited)"),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(plan: AdminPlan | null): FormValues {
  if (!plan) return { key: "", name: "", description: "", priceMonthlyDollars: "", priceYearlyDollars: "", monthlyCredits: "", maxResumes: "", maxWorkspaces: "", regenPerDay: "" };
  return {
    key: plan.key,
    name: plan.name,
    description: plan.description ?? "",
    priceMonthlyDollars: (plan.priceMonthlyCents / 100).toString(),
    priceYearlyDollars: (plan.priceYearlyCents / 100).toString(),
    monthlyCredits: String(plan.monthlyCredits),
    maxResumes: String(plan.limits.maxResumes),
    maxWorkspaces: String(plan.limits.maxWorkspaces),
    regenPerDay: String(plan.limits.regenPerDay),
  };
}

export function PlanManagement() {
  const { data: plans, isLoading, error } = useAdminPlans();
  const [editing, setEditing] = useState<AdminPlan | null | "new">(null);
  const [archiving, setArchiving] = useState<AdminPlan | null>(null);
  const archive = useArchivePlan();

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <H1>Plans</H1>
          <Button icon={PlusIcon} onClick={() => setEditing("new")}>
            New plan
          </Button>
        </div>

        <div className="rounded-lg bg-primary/4 px-4 py-3 text-sm text-ink-secondary">
          <InformationCircleIcon className="mr-1.5 inline h-4 w-4 text-primary" />
          Changes sync to Stripe automatically. Editing a price affects only new checkouts — existing subscribers keep the price they signed up at.
        </div>

        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : !plans?.length ? (
          <EmptyState title="No plans yet" description="Create the first plan to start billing." />
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <Card key={p.id} className={cn(!p.active && "opacity-60")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <H3>{p.name}</H3>
                      <span className="font-mono text-xs text-ink-muted">{p.key}</span>
                      {!p.active && <span className="rounded-md bg-ink-muted/10 px-2 py-0.5 text-xs text-ink-secondary">Archived</span>}
                    </div>
                    <Caption className="mt-1 block">
                      ${(p.priceMonthlyCents / 100).toFixed(0)}/mo · ${(p.priceYearlyCents / 100).toFixed(0)}/yr · {p.monthlyCredits} credits/mo
                    </Caption>
                    {p.stripeProductId && (
                      <Caption className="mt-0.5 block font-mono text-[10px]">
                        {p.stripeProductId} · {p.stripePriceIds.monthly || "no monthly price"}
                      </Caption>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="secondary" icon={PencilIcon} onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    {p.active && (
                      <Button size="sm" variant="ghost" icon={NoSymbolIcon} onClick={() => setArchiving(p)}>
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {editing && <PlanEditorDialog plan={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

        <Modal open={!!archiving} onClose={() => setArchiving(null)} title="Archive plan?">
          <div className="space-y-4">
            <Body>
              {archiving?.name} will be hidden from new checkouts. Existing subscribers keep billing normally — this can&apos;t be undone from here (never
              hard-deleted server-side, but re-creating it makes a new plan).
            </Body>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" icon={XMarkIcon} onClick={() => setArchiving(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={NoSymbolIcon}
                loading={archive.isPending}
                onClick={() => archiving && archive.mutate(archiving.id, { onSuccess: () => setArchiving(null) })}
              >
                Archive
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminQueryBoundary>
  );
}

function PlanEditorDialog({ plan, onClose }: { plan: AdminPlan | null; onClose: () => void }) {
  const isEdit = !!plan;
  const save = useSavePlan();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(plan) });
  const priceMonthlyDollars = useWatch({ control, name: "priceMonthlyDollars" });
  const priceYearlyDollars = useWatch({ control, name: "priceYearlyDollars" });

  const priceChanged = isEdit && (priceMonthlyDollars !== toFormValues(plan).priceMonthlyDollars || priceYearlyDollars !== toFormValues(plan).priceYearlyDollars);

  const onSubmit = (values: FormValues) => {
    const body = {
      key: values.key,
      name: values.name,
      description: values.description || undefined,
      priceMonthlyCents: Math.round(Number(values.priceMonthlyDollars) * 100),
      priceYearlyCents: Math.round(Number(values.priceYearlyDollars) * 100),
      monthlyCredits: Number(values.monthlyCredits),
      limits: { maxResumes: Number(values.maxResumes), maxWorkspaces: Number(values.maxWorkspaces), regenPerDay: Number(values.regenPerDay) },
      displayOrder: plan?.displayOrder ?? 0,
    };
    save.mutate(
      { id: plan?.id, ...body },
      {
        onSuccess: onClose,
        // VALIDATION_FAILED field names are the backend's own (priceMonthlyCents, limits.maxResumes,
        // ...), which don't line up 1:1 with this form's dollar-string field names — mapping only
        // the fields whose names DO match directly (name/key/description/monthlyCredits) and
        // falling back to a top-level message for everything else avoids silently losing an error
        // the generic applyFieldErrors helper would otherwise attach to a field nothing renders.
        onError: (err) => {
          if (err instanceof ApiError && err.code === "VALIDATION_FAILED" && err.fields) {
            const directMap: Partial<Record<string, keyof FormValues>> = { name: "name", key: "key", description: "description", monthlyCredits: "monthlyCredits" };
            let anyMapped = false;
            for (const [field, messages] of Object.entries(err.fields)) {
              const mapped = directMap[field];
              if (mapped) {
                setError(mapped, { message: messages[0] });
                anyMapped = true;
              }
            }
            if (!anyMapped) setError("root", { message: Object.values(err.fields)[0]?.[0] ?? err.message });
            return;
          }
          setError("root", { message: err instanceof ApiError ? err.message : "Save failed — check Stripe connection" });
        },
      },
    );
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? `Edit ${plan.name}` : "New plan"} className="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Key" placeholder="pro" disabled={isEdit} helper={isEdit ? "Immutable after creation" : undefined} error={errors.key?.message} {...register("key")} />
        <Input label="Name" error={errors.name?.message} {...register("name")} />
        <Input label="Description" {...register("description")} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Monthly price ($)" type="number" step="0.01" error={errors.priceMonthlyDollars?.message} {...register("priceMonthlyDollars")} />
          <Input label="Yearly price ($)" type="number" step="0.01" error={errors.priceYearlyDollars?.message} {...register("priceYearlyDollars")} />
        </div>

        {priceChanged && (
          <div className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
            Changing the price creates a new Stripe price for new checkouts. Anyone already subscribed keeps their current price — they are not re-billed at
            the new rate.
          </div>
        )}

        <Input label="Monthly credits" type="number" error={errors.monthlyCredits?.message} {...register("monthlyCredits")} />
        <div className="grid grid-cols-3 gap-3">
          <Input label="Max resumes" type="number" helper="-1 = ∞" error={errors.maxResumes?.message} {...register("maxResumes")} />
          <Input label="Max workspaces" type="number" helper="-1 = ∞" error={errors.maxWorkspaces?.message} {...register("maxWorkspaces")} />
          <Input label="Regens/day" type="number" helper="-1 = ∞" error={errors.regenPerDay?.message} {...register("regenPerDay")} />
        </div>

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" icon={XMarkIcon} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={CheckIcon} loading={save.isPending} disabled={isEdit && !isDirty}>
            {isEdit ? "Save & sync to Stripe" : "Create & sync to Stripe"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
