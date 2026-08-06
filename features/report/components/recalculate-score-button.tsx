"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Body, Caption } from "@/components/ui/typography";
import { toast } from "@/components/ui/toast";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCredits } from "@/features/credits/credits.hooks";
import { useUiStore } from "@/stores/ui.store";
import { useVersions } from "@/features/versions/hooks/use-versions";
import { ApiError } from "@/lib/api/error";
import { useRescore } from "../hooks/use-rescore";
import { useRescorePoll } from "../hooks/use-rescore-poll";
import type { AtsReport } from "../report.types";

const RESCORE_COST = 5;

export function RecalculateScoreButton({ workspaceId, resumeId, report }: { workspaceId: string; resumeId: string; report: AtsReport }) {
  const { data: credits } = useCredits();
  const { versions } = useVersions(resumeId);
  const rescore = useRescore(workspaceId);
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previousReportId, setPreviousReportId] = useState<string | null>(null);

  const poll = useRescorePoll(workspaceId, previousReportId, previousReportId !== null);
  // Derived, not reset via setState-in-effect: once the poll lands a genuinely new report
  // (report.id itself updates via the shared query cache), this naturally goes false again.
  const polling = previousReportId !== null && !poll.done;

  // No versions ever recorded (never applied/restored) -> nothing has changed since the report's
  // own resumeVersion, so fall back to that as the "current" baseline.
  const currentVersion = versions.length ? Math.max(...versions.map((v) => v.version)) : report.resumeVersion;
  const upToDate = currentVersion <= report.resumeVersion;

  const onConfirm = () => {
    // Snapshot the report id BEFORE mutating, and only start polling on success — starting
    // polling pre-emptively (before the request even resolves) would poll against a report id
    // that might never change if the request fails.
    const reportIdAtClick = report.id;
    rescore.mutate(crypto.randomUUID(), {
      onSuccess: () => {
        setConfirmOpen(false);
        setPreviousReportId(reportIdAtClick);
      },
      onError: (err) => {
        setConfirmOpen(false);
        if (!(err instanceof ApiError)) return;
        if (err.code === "INSUFFICIENT_CREDITS") {
          openUpgradeModal(err.details);
          return;
        }
        if (err.code === "NO_CHANGES_TO_RESCORE") {
          toast(err.message, "warning");
        }
      },
    });
  };

  const onClick = () => {
    if ((credits?.balance ?? 0) < RESCORE_COST) {
      openUpgradeModal({ required: RESCORE_COST, balance: credits?.balance ?? 0 });
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" size="sm" icon={ArrowPathIcon} loading={polling} disabled={upToDate} onClick={onClick}>
        Recalculate score
      </Button>
      {upToDate && !polling && <Caption>No changes since your last score</Caption>}
      {polling && <Caption>Recalculating…</Caption>}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Recalculate score?">
        <div className="space-y-4">
          <Body>This will cost {RESCORE_COST} credits and re-score your resume against this job — useful after applying suggestions.</Body>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={rescore.isPending} onClick={onConfirm}>
              Recalculate — {RESCORE_COST} credits
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
