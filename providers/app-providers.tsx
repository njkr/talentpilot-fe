"use client";

import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { queryClient } from "@/lib/query";
import { Toaster } from "@/components/ui/toast";
import { AuthBootstrap } from "./auth-bootstrap";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastPrimitive.Provider swipeDirection="right">
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster />
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80" />
      </ToastPrimitive.Provider>
    </QueryClientProvider>
  );
}
