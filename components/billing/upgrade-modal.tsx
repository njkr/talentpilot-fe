"use client";

import Link from "next/link";
import { useUiStore } from "@/stores/ui.store";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";

// Mounted once globally (see AppShell). Any code anywhere in the authed app can trigger it via
// useUiStore.getState().openUpgradeModal(details) — this is what error-actions.ts's
// `{ kind: 'modal', modal: 'upgrade' }` action is meant to drive.
export function UpgradeModal() {
  const open = useUiStore((s) => s.upgradeModalOpen);
  const details = useUiStore((s) => s.upgradeModalDetails);
  const close = useUiStore((s) => s.closeUpgradeModal);

  return (
    <Modal open={open} onClose={close} title="Upgrade to continue">
      <Body>{describe(details)}</Body>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>
          Not now
        </Button>
        <Button asChild onClick={close}>
          <Link href="/billing">View plans</Link>
        </Button>
      </div>
    </Modal>
  );
}

function describe(details: Record<string, unknown> | null): string {
  if (details && "required" in details && "balance" in details) {
    return `This needs ${details.required} credits, but you have ${details.balance}. Upgrade your plan or wait for your next credit refill.`;
  }
  if (details && "limit" in details && "current" in details) {
    const feature = typeof details.feature === "string" ? details.feature : "this";
    return `You're using ${details.current} of ${details.limit} ${feature}. Upgrade your plan to add more.`;
  }
  return "You've reached a limit on your current plan. Upgrade for more credits and higher limits.";
}
