"use client";

import { useEffect, useState } from "react";

interface ResendButtonProps {
  // Returns a retryAfterSec override (e.g. from a caught OTP_COOLDOWN error) or undefined to use
  // the default 60s — kept async so the caller can await the mutation and inspect its error.
  onResend: () => Promise<number | void>;
  pending: boolean;
}

// 60s cooldown mirrors the backend's OTP_RESEND_COOLDOWN_SEC. If the backend returns OTP_COOLDOWN
// with details.retryAfterSec (e.g. after a page reload resets our local timer but not the
// server's), the caller passes that back through onResend's return value to stay in sync.
export function ResendButton({ onResend, pending }: ResendButtonProps) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handle = async () => {
    const override = await onResend();
    setCooldown(typeof override === "number" ? override : 60);
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
