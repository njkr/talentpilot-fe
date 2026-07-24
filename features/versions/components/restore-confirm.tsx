import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";

interface RestoreConfirmProps {
  open: boolean;
  onClose: () => void;
  version: number;
  currentVersion: number;
  onConfirm: () => void;
  restoring: boolean;
}

export function RestoreConfirm({ open, onClose, version, currentVersion, onConfirm, restoring }: RestoreConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={`Restore version ${version}?`}>
      <Body>
        This copies version {version}&apos;s content forward as a new version {currentVersion + 1}. Nothing is deleted — versions {version + 1}–{currentVersion} stay in your history and you can return to
        them at any time.
      </Body>
      <div className="mt-4 flex gap-2">
        <Button onClick={onConfirm} loading={restoring}>
          Restore as v{currentVersion + 1}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
