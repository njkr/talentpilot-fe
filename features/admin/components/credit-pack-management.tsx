"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, PencilIcon, CheckCircleIcon, NoSymbolIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { H1, H3, Body, Caption } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/error";
import { useAdminCreditPacks, useSaveCreditPack, useArchiveCreditPack, useActivateCreditPack } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { AdminCreditPack } from "../admin.types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  credits: z.string().refine((v) => v !== "" && Number.isInteger(Number(v)) && Number(v) > 0, "Enter a whole number > 0"),
  priceDollars: z.string().refine((v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) > 0, "Enter a number > 0"),
  bestValue: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(pack: AdminCreditPack | null): FormValues {
  if (!pack) return { name: "", credits: "", priceDollars: "", bestValue: false };
  return { name: pack.name, credits: String(pack.credits), priceDollars: (pack.priceCents / 100).toString(), bestValue: pack.bestValue };
}

export function CreditPackManagement() {
  const { data: packs, isLoading, error } = useAdminCreditPacks();
  const [editing, setEditing] = useState<AdminCreditPack | null | "new">(null);
  const [archiving, setArchiving] = useState<AdminCreditPack | null>(null);
  const archive = useArchiveCreditPack();
  const activate = useActivateCreditPack();

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <H1>Credit packs</H1>
          <Button icon={PlusIcon} onClick={() => setEditing("new")}>
            New pack
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : !packs?.length ? (
          <EmptyState title="No credit packs yet" description="Create one to let users top up outside their plan's monthly allowance." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <Card key={pack.id} className={cn(!pack.active && "opacity-60")}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <H3>{pack.name}</H3>
                      {!pack.active && <span className="rounded-md bg-ink-muted/10 px-2 py-0.5 text-xs text-ink-secondary">Archived</span>}
                    </div>
                    <p className="mt-1 text-2xl font-bold text-ink">
                      {pack.credits}
                      <span className="ml-1 text-sm font-normal text-ink-secondary">credits</span>
                    </p>
                    {/* $/credit, computed not stored — helps price larger packs at a sensible volume discount. */}
                    <Caption className="mt-1 block">
                      ${(pack.priceCents / 100).toFixed(2)} · ${(pack.priceCents / pack.credits / 100).toFixed(3)}/credit
                    </Caption>
                    {pack.bestValue && <span className="mt-2 inline-block rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Best value</span>}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" icon={PencilIcon} onClick={() => setEditing(pack)}>
                    Edit
                  </Button>
                  {pack.active ? (
                    // "Deactivate" IS the real DELETE endpoint underneath — confirmed live there is
                    // no hard-delete for credit packs (it archives the Stripe product + price and
                    // sets active=false; the record and its history stay, reversible via Activate).
                    // Labeled and styled (no `danger` variant) to match what actually happens rather
                    // than implying permanent removal.
                    <Button size="sm" variant="ghost" icon={NoSymbolIcon} onClick={() => setArchiving(pack)}>
                      Deactivate
                    </Button>
                  ) : (
                    // Reactivating creates a BRAND-NEW Stripe price even with no price change
                    // (confirmed live — archived prices can't be un-archived) — same "synced to
                    // Stripe" cost as any other save, so it goes through the loading state too.
                    <Button size="sm" variant="secondary" icon={CheckCircleIcon} loading={activate.isPending} onClick={() => activate.mutate(pack.id)}>
                      Activate
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {editing && <PackEditorDialog pack={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

        <Modal open={!!archiving} onClose={() => setArchiving(null)} title="Deactivate credit pack?">
          <div className="space-y-4">
            <Body>
              {archiving?.name} will be hidden from the buy-credits panel immediately. It isn&apos;t permanently removed — the backend has no hard-delete for credit packs, so this
              archives it instead; you can activate it again later from this page.
            </Body>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" icon={XMarkIcon} onClick={() => setArchiving(null)}>
                Cancel
              </Button>
              <Button variant="danger" icon={NoSymbolIcon} loading={archive.isPending} onClick={() => archiving && archive.mutate(archiving.id, { onSuccess: () => setArchiving(null) })}>
                Deactivate
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminQueryBoundary>
  );
}

function PackEditorDialog({ pack, onClose }: { pack: AdminCreditPack | null; onClose: () => void }) {
  const isEdit = !!pack;
  const save = useSaveCreditPack();
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(pack) });
  const priceDollars = useWatch({ control, name: "priceDollars" });
  const bestValue = useWatch({ control, name: "bestValue" });

  const onSubmit = (values: FormValues) => {
    const body = { name: values.name, credits: Number(values.credits), priceCents: Math.round(Number(values.priceDollars) * 100), bestValue: values.bestValue };
    save.mutate(
      { id: pack?.id, ...body },
      {
        onSuccess: onClose,
        onError: (err) => {
          if (err instanceof ApiError && err.code === "VALIDATION_FAILED" && err.fields) {
            const directMap: Partial<Record<string, keyof FormValues>> = { name: "name", credits: "credits" };
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
    <Modal open onClose={onClose} title={isEdit ? `Edit ${pack.name}` : "New pack"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" error={errors.name?.message} {...register("name")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Credits" type="number" error={errors.credits?.message} {...register("credits")} />
          <Input label="Price ($)" type="number" step="0.01" error={errors.priceDollars?.message} {...register("priceDollars")} />
        </div>

        {isEdit && pack.priceCents !== Math.round(Number(priceDollars) * 100) && (
          <div className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">Changing the price creates a new one-time Stripe price for new purchases.</div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm text-ink">Best value</span>
          <Switch checked={bestValue} onCheckedChange={(v) => setValue("bestValue", v, { shouldDirty: true })} aria-label="Best value" />
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
