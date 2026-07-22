import type { PropsWithChildren } from "react";

// Public route group — centered, minimal, no sidebar.
export default function AuthLayout({ children }: PropsWithChildren) {
  return <div className="min-h-screen grid place-items-center bg-bg px-4">{children}</div>;
}
