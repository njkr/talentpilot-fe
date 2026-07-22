"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  onComplete: (v: string) => void;
  disabled?: boolean;
}

// Six boxes, auto-advance, paste support, auto-submit when the 6th digit lands.
export function OtpInput({ value, onChange, onComplete, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, d: string) => {
    if (!/^\d?$/.test(d)) return;
    const next = value.split("");
    next[i] = d;
    const joined = next.join("").slice(0, 6);
    onChange(joined);
    if (d && i < 5) refs.current[i + 1]?.focus();
    if (joined.length === 6 && !joined.includes("")) onComplete(joined); // auto-submit when full
  };

  return (
    <div
      className="flex justify-center gap-2"
      onPaste={(e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
          onChange(pasted);
          onComplete(pasted);
        }
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "h-12 w-11 rounded-lg border border-border bg-card text-center text-lg font-semibold text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
        />
      ))}
    </div>
  );
}
