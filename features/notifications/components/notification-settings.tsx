"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Body, Caption } from "@/components/ui/typography";
import { NOTIFICATION_TYPES } from "../notifications.api";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "../notifications.hooks";

export function NotificationSettings() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  if (isLoading || !prefs) return <Skeleton className="h-64 rounded-xl" />;

  const disabled = new Set(prefs.emailDisabled);

  const toggle = (type: string) => {
    const next = new Set(disabled);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    update.mutate([...next]);
  };

  return (
    <Card>
      <H3 className="mb-1">Email notifications</H3>
      <Body className="mb-4">In-app notifications are always on. Choose which ones also send an email.</Body>

      <div className="divide-y divide-border">
        {NOTIFICATION_TYPES.map((n) => (
          <div key={n.type} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-ink">{n.label}</p>
              <Caption>{n.description}</Caption>
            </div>
            <Switch checked={!disabled.has(n.type)} onCheckedChange={() => toggle(n.type)} disabled={update.isPending} aria-label={`Email for ${n.label}`} />
          </div>
        ))}
      </div>
    </Card>
  );
}
