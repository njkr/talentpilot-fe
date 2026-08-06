"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { H1, Body } from "@/components/ui/typography";
import { ApiError } from "@/lib/api/error";
import { useAdminAffiliateLinks, useSaveAffiliateLink, useDeleteAffiliateLink } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import { AFFILIATE_LINK_RESOURCE_TYPES, type AdminAffiliateLink, type AffiliateLinkResourceType } from "../admin.types";

const schema = z.object({
  resourceType: z.enum(AFFILIATE_LINK_RESOURCE_TYPES),
  keyword: z.string(),
  urlTemplate: z
    .string()
    .min(1, "Required")
    .refine((v) => v.includes("{query}"), 'Must contain the literal "{query}" placeholder'),
  label: z.string().min(1, "Required"),
  priority: z.string().refine((v) => v !== "" && Number.isInteger(Number(v)), "Enter a whole number"),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(link: AdminAffiliateLink | null): FormValues {
  if (!link) return { resourceType: "documentation", keyword: "", urlTemplate: "", label: "", priority: "0", active: true };
  return { resourceType: link.resourceType, keyword: link.keyword ?? "", urlTemplate: link.urlTemplate, label: link.label, priority: String(link.priority), active: link.active };
}

export function AffiliateLinkManagement() {
  const { data: links, isLoading, error } = useAdminAffiliateLinks();
  const [editing, setEditing] = useState<AdminAffiliateLink | null | "new">(null);
  const [deleting, setDeleting] = useState<AdminAffiliateLink | null>(null);
  const save = useSaveAffiliateLink();
  const del = useDeleteAffiliateLink();

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <H1>Affiliate links</H1>
          <Button icon={PlusIcon} onClick={() => setEditing("new")}>
            New link
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : !links?.length ? (
            <EmptyState title="No affiliate links configured" description="Add a default template per resource type, plus keyword overrides for specific topics." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-ink-secondary">
                    <th className="pb-2 pr-4 font-medium whitespace-nowrap">Resource type</th>
                    <th className="pb-2 pr-4 font-medium whitespace-nowrap">Keyword</th>
                    <th className="pb-2 pr-4 font-medium">URL template</th>
                    <th className="pb-2 pr-4 font-medium whitespace-nowrap">Label</th>
                    <th className="pb-2 pr-4 font-medium text-right whitespace-nowrap">Priority</th>
                    <th className="pb-2 pr-4 font-medium whitespace-nowrap">Active</th>
                    <th className="pb-2 font-medium text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {links.map((link) => (
                    <tr key={link.id}>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-ink">{link.resourceType}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-ink-secondary">{link.keyword ?? <span className="text-ink-muted">— (default)</span>}</td>
                      <td className="max-w-0 w-full truncate py-2.5 pr-4 font-mono text-xs text-ink-secondary" title={link.urlTemplate}>
                        {link.urlTemplate}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap text-ink-secondary">{link.label}</td>
                      <td className="py-2.5 pr-4 text-right whitespace-nowrap text-ink-secondary">{link.priority}</td>
                      <td className="py-2.5 pr-4">
                        <Switch checked={link.active} onCheckedChange={(active) => save.mutate({ id: link.id, active })} aria-label={`${link.active ? "Deactivate" : "Activate"} ${link.label}`} />
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" icon={PencilIcon} onClick={() => setEditing(link)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" icon={TrashIcon} onClick={() => setDeleting(link)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {editing && <LinkEditorDialog link={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

        <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete affiliate link?">
          <div className="space-y-4">
            <Body>
              {deleting?.label} will be permanently deleted — unlike plans or credit packs, this is a real hard delete with no archive/undo. Roadmap items that would have matched it fall back to
              the next-best template (or no affiliate link at all).
            </Body>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" icon={XMarkIcon} onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="danger" icon={TrashIcon} loading={del.isPending} onClick={() => deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}>
                Delete permanently
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminQueryBoundary>
  );
}

function LinkEditorDialog({ link, onClose }: { link: AdminAffiliateLink | null; onClose: () => void }) {
  const isEdit = !!link;
  const save = useSaveAffiliateLink();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(link) });
  const resourceType = useWatch({ control, name: "resourceType" });
  const active = useWatch({ control, name: "active" });

  const onSubmit = (values: FormValues) => {
    const body = {
      resourceType: values.resourceType,
      keyword: values.keyword.trim() || undefined,
      urlTemplate: values.urlTemplate,
      label: values.label,
      priority: Number(values.priority),
      active: values.active,
    };
    save.mutate(
      { id: link?.id, ...body },
      {
        onSuccess: onClose,
        onError: (err) => {
          if (err instanceof ApiError && err.code === "VALIDATION_FAILED" && err.fields) {
            const directMap: Partial<Record<string, keyof FormValues>> = { urlTemplate: "urlTemplate", label: "label", keyword: "keyword" };
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
          // Real 409 — no natural field to attach this to (it's a resourceType+null-keyword
          // combo conflict), so a concrete, actionable root message instead of the backend's own
          // generic "That already exists."
          if (err instanceof ApiError && err.code === "ALREADY_EXISTS") {
            setError("root", { message: "There's already a default template for this resource type — edit that one, or set a keyword to add an override instead." });
            return;
          }
          setError("root", { message: err instanceof ApiError ? err.message : "Save failed — try again" });
        },
      },
    );
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? `Edit ${link.label}` : "New affiliate link"} className="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Resource type"
          value={resourceType}
          onValueChange={(v) => setValue("resourceType", v as AffiliateLinkResourceType, { shouldDirty: true })}
          options={AFFILIATE_LINK_RESOURCE_TYPES.map((t) => ({ value: t, label: t }))}
        />
        <Input label="Keyword" placeholder="aws" helper="Leave blank to set the default template for this resource type" error={errors.keyword?.message} {...register("keyword")} />
        <Input
          label="URL template"
          placeholder="https://example.com/search?q={query}"
          helper='Must include the literal "{query}" placeholder — the item title is substituted in at read time'
          error={errors.urlTemplate?.message}
          {...register("urlTemplate")}
        />
        <Input label="Label" placeholder="Amazon book search" error={errors.label?.message} {...register("label")} />
        <Input label="Priority" type="number" helper="Higher outranks a lower one when multiple keywords match" error={errors.priority?.message} {...register("priority")} />

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm text-ink">Active</span>
          <Switch checked={active} onCheckedChange={(v) => setValue("active", v, { shouldDirty: true })} aria-label="Active" />
        </div>

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" icon={XMarkIcon} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={CheckIcon} loading={save.isPending} disabled={isEdit && !isDirty}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
