"use client";

import { useState } from "react";
import { ChevronDownIcon, NoSymbolIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ChipGroup } from "@/components/ui/chip-group";
import { H1, Body } from "@/components/ui/typography";
import { useAuthStore } from "@/stores/auth.store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAdminUsers, useSuspendUser, useActivateUser } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";
import type { AdminUserRow, AdminUserStatus } from "../admin.types";

function statusTone(status: AdminUserStatus): "success" | "danger" | "neutral" {
  return status === "active" ? "success" : status === "suspended" ? "danger" : "neutral";
}

export function UserManagement() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400); // status is discrete ChipGroup clicks — no debounce needed there
  const [status, setStatus] = useState<AdminUserStatus | "all">("all");
  const [suspending, setSuspending] = useState<AdminUserRow | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id); // read once, not per-row

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminUsers({ search: search || undefined, status });
  const rows = data?.pages.flatMap((p) => p.data) ?? [];
  const suspend = useSuspendUser();
  const activate = useActivateUser();

  return (
    <AdminQueryBoundary error={error}>
      <div className="space-y-4">
        <H1>Users</H1>

        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Search by email" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="max-w-xs" />
          <ChipGroup
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "deleted", label: "Deleted" },
            ]}
          />
        </div>

        <Card>
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : rows.length === 0 ? (
            <EmptyState title="No users match this filter" description="Try a different search or status." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-ink-secondary">
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium text-right">Lifetime spend</th>
                    <th className="pb-2 font-medium text-right">Resumes</th>
                    <th className="pb-2 font-medium text-right">Cover letters</th>
                    <th className="pb-2 font-medium text-right">Referrals</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <UserRow key={row.id} row={row} isSelf={row.id === currentUserId} onSuspend={() => setSuspending(row)} onActivate={() => activate.mutate(row.id)} activatePending={activate.isPending} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {hasNextPage && (
            <Button variant="ghost" icon={ChevronDownIcon} className="mt-3 w-full" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
              Load more
            </Button>
          )}
        </Card>

        <Modal open={!!suspending} onClose={() => setSuspending(null)} title="Revoke access?">
          <div className="space-y-4">
            <Body>
              {suspending?.email} will be blocked from signing in or refreshing their session going forward. This is not instant — if they currently have a valid access token, it stays usable until it
              naturally expires (up to ~10 minutes). This can be undone with Activate.
            </Body>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" icon={XMarkIcon} onClick={() => setSuspending(null)}>
                Cancel
              </Button>
              <Button variant="danger" icon={NoSymbolIcon} loading={suspend.isPending} onClick={() => suspending && suspend.mutate(suspending.id, { onSuccess: () => setSuspending(null) })}>
                Revoke access
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminQueryBoundary>
  );
}

function UserRow({
  row,
  isSelf,
  onSuspend,
  onActivate,
  activatePending,
}: {
  row: AdminUserRow;
  isSelf: boolean;
  onSuspend: () => void;
  onActivate: () => void;
  activatePending: boolean;
}) {
  return (
    <tr>
      <td className="py-2.5 text-ink">{row.email}</td>
      <td className="py-2.5">
        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
      </td>
      <td className="py-2.5 text-ink-secondary">{row.planName}</td>
      <td className="py-2.5 text-right font-mono text-xs text-ink-secondary">${Number(row.totalSpendUsd).toFixed(2)}</td>
      <td className="py-2.5 text-right text-ink-secondary">{row.resumeCount}</td>
      <td className="py-2.5 text-right text-ink-secondary">{row.coverLetterCount}</td>
      <td className="py-2.5 text-right font-mono text-xs text-ink-secondary">
        {row.referrals.invited} / {row.referrals.qualified}
      </td>
      <td className="py-2.5 text-right">
        {row.status === "active" && !isSelf && (
          <Button size="sm" variant="ghost" icon={NoSymbolIcon} onClick={onSuspend}>
            Suspend
          </Button>
        )}
        {row.status === "suspended" && (
          <Button size="sm" variant="secondary" icon={CheckCircleIcon} loading={activatePending} onClick={onActivate}>
            Activate
          </Button>
        )}
        {/* status === "deleted": no action — nothing makes sense on a soft-deleted account */}
      </td>
    </tr>
  );
}
