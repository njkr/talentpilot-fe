"use client";

import { useState } from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Body } from "@/components/ui/typography";
import { ApiError } from "@/lib/api/error";
import { useDeleteResume } from "../hooks/use-delete-resume";
import { useRenameResume } from "../hooks/use-rename-resume";
import { useRetryResume } from "../hooks/use-retry-resume";
import type { Resume } from "../resume.types";

interface Workspace {
  id: string;
  name: string;
}

export function ResumeCardActions({ resume }: { resume: Resume }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(resume.title);
  const rename = useRenameResume();
  const del = useDeleteResume();
  const retry = useRetryResume();

  // 409 RESUME_IN_USE carries the blocking workspaces in details — surface exactly which ones,
  // not a generic "can't delete" error.
  const blockingWorkspaces = del.error instanceof ApiError && del.error.code === "RESUME_IN_USE" ? ((del.error.details?.workspaces as Workspace[]) ?? []) : null;

  return (
    <div onClick={(e) => e.preventDefault()}>
      {resume.status === "failed" && (
        <Button size="sm" variant="secondary" onClick={() => retry.mutate(resume.id)} loading={retry.isPending}>
          Retry
        </Button>
      )}

      <DropdownMenu
        trigger={
          <button className="text-ink-muted hover:text-ink" aria-label="Resume actions">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        }
        items={[
          { label: "Rename", onSelect: () => setRenameOpen(true) },
          { label: "Delete", onSelect: () => setDeleteOpen(true), danger: true },
        ]}
      />

      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Rename resume">
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} label="Title" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={rename.isPending}
              onClick={() =>
                rename.mutate(
                  { id: resume.id, title },
                  {
                    onSuccess: () => setRenameOpen(false),
                  },
                )
              }
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={blockingWorkspaces ? "This resume is in use" : "Delete resume?"}>
        <div className="space-y-4">
          {blockingWorkspaces ? (
            <Body>
              This resume is used by {blockingWorkspaces.length} workspace{blockingWorkspaces.length === 1 ? "" : "s"}:{" "}
              {blockingWorkspaces.map((w) => w.name).join(", ")}. Delete those first, or keep the resume.
            </Body>
          ) : (
            <Body>This can&apos;t be undone.</Body>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {blockingWorkspaces ? "OK" : "Cancel"}
            </Button>
            {!blockingWorkspaces && (
              <Button
                variant="danger"
                loading={del.isPending}
                onClick={() =>
                  del.mutate(resume.id, {
                    onSuccess: () => setDeleteOpen(false),
                  })
                }
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
