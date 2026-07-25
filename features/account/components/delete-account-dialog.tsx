"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";
import { useDeleteAccount } from "../hooks/use-account";

const CONFIRM_WORD = "DELETE";

export function DeleteAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const del = useDeleteAccount();
  const canDelete = confirmText === CONFIRM_WORD;

  return (
    <Modal open={open} onClose={onClose} title="Delete your account?">
      <div className="space-y-4">
        <Body>
          This is permanent. Every session is signed out immediately, and your data is fully purged after 30 days. Type <span className="font-mono font-semibold text-ink">{CONFIRM_WORD}</span> to
          confirm.
        </Body>
        <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={CONFIRM_WORD} aria-label={`Type ${CONFIRM_WORD} to confirm`} />
        <div className="flex gap-2">
          <Button variant="danger" disabled={!canDelete} loading={del.isPending} onClick={() => del.mutate()}>
            Permanently delete
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
