"use client";

import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { queryClient } from "@/lib/query";
import { Toaster } from "@/components/ui/toast";

// The session-bootstrap (attempt /auth/refresh on mount) is added in Sprint 1 — it needs the auth
// flow. This just wires the providers so later sprints have somewhere to hang it.
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <Toaster />
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80" />
      </ToastPrimitive.Provider>
    </QueryClientProvider>
  );
}
