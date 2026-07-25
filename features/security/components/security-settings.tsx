"use client";

import { ComputerDesktopIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { H3, Body, Caption } from "@/components/ui/typography";
import { timeAgo } from "@/lib/utils";
import { useRevokeSession, useSessions } from "../hooks/use-sessions";
import { parseUserAgent, isMobileUserAgent } from "../parse-user-agent";

export function SecuritySettings() {
  const { data: sessions, isLoading } = useSessions();
  const revoke = useRevokeSession();

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <Card>
      <H3 className="mb-1">Active sessions</H3>
      <Body className="mb-4">Devices where you&apos;re currently signed in.</Body>

      {!sessions || sessions.length === 0 ? (
        <EmptyState compact title="No other sessions" description="Nothing to show here." />
      ) : (
        // Confirmed live this can be a long list (50+ in real testing) — bounded height + scroll
        // rather than an unbounded page-stretching list.
        <div className="max-h-96 divide-y divide-border overflow-y-auto">
          {sessions.map((s) => {
            const Icon = isMobileUserAgent(s.userAgent) ? DevicePhoneMobileIcon : ComputerDesktopIcon;
            return (
              <div key={s.familyId} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{parseUserAgent(s.userAgent)}</p>
                    <Caption>
                      {s.ip} · signed in {timeAgo(s.createdAt)}
                    </Caption>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  loading={revoke.isPending && revoke.variables === s.familyId}
                  disabled={revoke.isPending && revoke.variables !== s.familyId}
                  onClick={() => revoke.mutate(s.familyId)}
                  aria-label={`Revoke session on ${parseUserAgent(s.userAgent)}`}
                >
                  Revoke
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Caption className="mt-4 block">Revoking signs that device out. To sign out this device, use &quot;Sign out&quot; in the account menu.</Caption>
    </Card>
  );
}
