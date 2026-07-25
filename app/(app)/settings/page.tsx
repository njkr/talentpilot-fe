"use client";

import { Tabs } from "@/components/ui/tabs";
import { H1 } from "@/components/ui/typography";
import { ProfileSettings } from "@/features/profile/components/profile-settings";
import { SecuritySettings } from "@/features/security/components/security-settings";
import { NotificationSettings } from "@/features/notifications/components/notification-settings";
import { AccountSettings } from "@/features/account/components/account-settings";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <H1>Settings</H1>
      <Tabs
        defaultValue="profile"
        items={[
          { value: "profile", label: "Profile", content: <ProfileSettings /> },
          { value: "security", label: "Security", content: <SecuritySettings /> },
          { value: "notifications", label: "Notifications", content: <NotificationSettings /> },
          { value: "account", label: "Account", content: <AccountSettings /> },
        ]}
      />
    </div>
  );
}
