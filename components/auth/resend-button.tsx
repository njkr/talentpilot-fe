"use client";

import { useEffect, useState } from "react";

// Explicit result instead of a bare `number | void` — a caught-and-swallowed error used to return
// `undefined`, indistinguishable from "no cooldown override, use the default 60s" success case.
// That made the button start the same countdown whether the resend actually worked or silently
// failed, with no error shown either way. Each variant now maps to exactly one button behavior.
export type ResendResult = { status: "sent" } | { status: "cooldown"; retryAfterSec: number } | { status: "error" };

interface ResendButtonProps {
  onResend: () => Promise<ResendResult>;
  pending: boolean;
}

// 60s cooldown mirrors the backend's OTP_RESEND_COOLDOWN_SEC.
export function ResendButton({ onResend, pending }: ResendButtonProps) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handle = async () => {
    const result = await onResend();
    if (result.status === "sent") setCooldown(60);
    else if (result.status === "cooldown") setCooldown(result.retryAfterSec);
    // "error": the caller already showed a toast — leave the button enabled, no fake countdown.
  };

  return (
    <button
      onClick={handle}
      disabled={cooldown > 0 || pending}
      className="w-full text-sm text-ink-secondary hover:text-ink disabled:opacity-50"
    >
      {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
    </button>
  );
}
