"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { FullPageSpinner } from "@/components/ui/full-page-spinner";
import { H2, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

// First gate only — role === 'admin', client-side, UX only. The backend's SECOND gate (the
// ADMIN_ALLOWED_EMAILS allowlist) can still reject a role-admin user; every admin query handles
// that itself via AdminQueryBoundary. This guard never assumes access just because someone
// reached the route — it only prevents an obviously-non-admin user from seeing a screen full of
// failed requests.
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  // Wait for the session bootstrap before deciding — same rule as RequireAuth: never act on 'loading'.
  if (status === "loading") return <FullPageSpinner />;

  if (status !== "authed" || user?.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="text-center">
          <H2>Not authorized</H2>
          <Body className="mt-1">This area is restricted.</Body>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/dashboard">Back to app</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
