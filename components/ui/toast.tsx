"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { create } from "zustand";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  message: string;
  tone: "default" | "error" | "warning" | "success";
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, tone?: ToastItem["tone"]) => void;
  dismiss: (id: number) => void;
}

let nextId = 0;

// UI-only transient state — belongs in Zustand, not React Query (it's not server data).
const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, tone = "default") =>
    set((s) => ({ items: [...s.items, { id: nextId++, message, tone }] })),
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

// The global entry point every error handler / mutation onError calls.
export const toast = (message: string, tone: ToastItem["tone"] = "default") => useToastStore.getState().push(message, tone);

const toneClass: Record<ToastItem["tone"], string> = {
  default: "border-border bg-card text-ink",
  error: "border-danger/30 bg-danger/5 text-danger",
  warning: "border-warning/30 bg-warning/5 text-ink",
  success: "border-success/30 bg-success/5 text-ink",
};

export function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <>
      {items.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          duration={5000}
          onOpenChange={(open) => !open && dismiss(item.id)}
          className={cn(
            "rounded-lg border p-3 shadow-md text-sm",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out",
            toneClass[item.tone],
          )}
        >
          <ToastPrimitive.Description>{item.message}</ToastPrimitive.Description>
        </ToastPrimitive.Root>
      ))}
    </>
  );
}
