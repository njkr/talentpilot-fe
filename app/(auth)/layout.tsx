import type { PropsWithChildren } from "react";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";

// Public route group — centered, minimal, no sidebar.
export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <RedirectIfAuthed>
      <div className="min-h-screen grid place-items-center bg-bg px-4">{children}</div>
    </RedirectIfAuthed>
  );
}
