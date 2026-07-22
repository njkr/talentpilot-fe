"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { H3, Caption } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useUnreadCount, useNotifications, useMarkRead, useMarkAllRead } from "@/features/notifications/notifications.hooks";
import type { Notification } from "@/features/notifications/notifications.api";
import { cn, timeAgo } from "@/lib/utils";

export function NotificationBell() {
  const { data: unread } = useUnreadCount();
  const list = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const router = useRouter();
  const count = unread?.count ?? 0;

  return (
    <PopoverPrimitive.Root onOpenChange={(open) => open && list.refetch()}>
      <PopoverPrimitive.Trigger className="relative text-ink-secondary hover:text-ink" aria-label="Notifications">
        <BellIcon className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="end" sideOffset={8} className="z-50 w-80 rounded-xl border border-border bg-card shadow-md">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <H3>Notifications</H3>
            {count > 0 && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-primary">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {list.isLoading ? (
              <div className="p-4">
                <Skeleton className="h-16" />
              </div>
            ) : !list.data?.data.length ? (
              <EmptyState compact title="You're all caught up" />
            ) : (
              list.data.data.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => {
                    if (!n.readAt) markRead.mutate(n.id);
                    if (n.data?.workspaceId) router.push(`/workspaces/${n.data.workspaceId}`);
                  }}
                />
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function NotificationRow({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex w-full gap-3 border-b border-border px-4 py-3 text-left hover:bg-bg", !notification.readAt && "bg-primary/[0.03]")}
    >
      <NotificationIcon type={notification.type} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{notification.title}</p>
        <p className="text-xs text-ink-secondary line-clamp-2">{notification.message}</p>
        <Caption>{timeAgo(notification.createdAt)}</Caption>
      </div>
      {!notification.readAt && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </button>
  );
}

// Real notification `type`s use the same dot-notation as the SSE pipeline events (run.completed,
// run.failed) — confirmed from the Postman collection's saved example, not the earlier
// analysis_complete/analysis_failed guess.
function NotificationIcon({ type }: { type: string }) {
  if (type === "run.completed") return <CheckCircleIcon className="h-5 w-5 shrink-0 text-success" />;
  if (type === "run.failed") return <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-danger" />;
  return <BellIcon className="h-5 w-5 shrink-0 text-ink-muted" />;
}
