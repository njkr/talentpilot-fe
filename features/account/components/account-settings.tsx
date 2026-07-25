"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { H3, Body } from "@/components/ui/typography";
import { useExportData } from "../hooks/use-account";
import { DeleteAccountDialog } from "./delete-account-dialog";

export function AccountSettings() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const exportData = useExportData();

  return (
    <div className="space-y-6">
      <Card>
        <H3>Export your data</H3>
        <Body className="mt-1 mb-3">Queue a full export of everything we hold about you. You&apos;ll get a notification with a download link once it&apos;s ready.</Body>
        <Button variant="secondary" loading={exportData.isPending} onClick={() => exportData.mutate()}>
          Request data export
        </Button>
      </Card>

      <Card className="border-danger/30">
        <H3 className="text-danger">Delete account</H3>
        <Body className="mt-1 mb-3">This permanently deletes your account, resumes, and analyses. Every session is signed out immediately, and your data is fully purged after 30 days. This can&apos;t be undone.</Body>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete my account
        </Button>
      </Card>

      <DeleteAccountDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </div>
  );
}
