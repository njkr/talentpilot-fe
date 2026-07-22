"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";
import { useDeleteJob } from "../hooks/use-delete-job";
import type { JobDescription } from "../job.types";

// There's no rename endpoint for job descriptions (only paste/upload/list/get/retry/delete) —
// unlike resumes, this menu is just Delete.
export function JobActions({ jd }: { jd: JobDescription }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const del = useDeleteJob();
  const router = useRouter();

  return (
    <div onClick={(e) => e.preventDefault()}>
      <DropdownMenu
        trigger={
          <button className="text-ink-muted hover:text-ink" aria-label="Job description actions">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        }
        items={[{ label: "Delete", onSelect: () => setDeleteOpen(true), danger: true }]}
      />

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete job description?">
        <div className="space-y-4">
          <Body>This can&apos;t be undone.</Body>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={() =>
                del.mutate(jd.id, {
                  onSuccess: () => {
                    setDeleteOpen(false);
                    router.push("/jobs");
                  },
                })
              }
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
