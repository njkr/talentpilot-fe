"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/auth.hooks";

export function LogoutButton() {
  const logout = useLogout();
  return (
    <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>
      Sign out
    </Button>
  );
}
