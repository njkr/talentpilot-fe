import type { PropsWithChildren } from "react";
import { RequireAuth } from "@/components/auth/require-auth";

// The app shell (sidebar/topbar) comes in Sprint 2. For now, just the guard.
export default function AppLayout({ children }: PropsWithChildren) {
  return <RequireAuth>{children}</RequireAuth>;
}
