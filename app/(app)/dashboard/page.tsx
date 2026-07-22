"use client";

import { H1 } from "@/components/ui/typography";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuthStore } from "@/stores/auth.store";

// Temporary placeholder — Sprint 2 replaces this with the real GET /dashboard view.
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="p-8 space-y-4">
      <H1>Welcome, {user?.email}</H1>
      <LogoutButton />
    </div>
  );
}
