"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { resumeApi } from "@/features/resumes/resume.api";
import { jobApi } from "@/features/jobs/job.api";
import { useCreateWorkspace } from "../hooks/use-create-workspace";
import { ResumePicker } from "./resume-picker";
import { JobPicker } from "./job-picker";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
  const { data: resumes } = useQuery({ queryKey: ["resumes"], queryFn: () => resumeApi.list(), enabled: open });
  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: () => jobApi.list(), enabled: open });
  const create = useCreateWorkspace();

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");

  // Only READY inputs are selectable. A parsing resume or analyzing JD can't be paired yet.
  const readyResumes = resumes?.data.filter((r) => r.status === "parsed") ?? [];
  const readyJobs = jobs?.data.filter((j) => j.status === "analyzed") ?? [];

  const submit = () => {
    const job = readyJobs.find((j) => j.id === jobId);
    if (!resumeId || !job) return;
    create.mutate(
      {
        resumeId,
        jobDescriptionId: jobId,
        name: `${job.company ?? "Job"} — ${job.position ?? "Role"}`,
      },
      {
        onSuccess: () => {
          setResumeId("");
          setJobId("");
          onClose();
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="New analysis">
      <div className="space-y-4">
        <ResumePicker resumes={readyResumes} value={resumeId} onChange={setResumeId} emptyHint="No parsed resumes — upload one first." />
        <JobPicker jobs={readyJobs} value={jobId} onChange={setJobId} emptyHint="No analyzed jobs — add one first." />
        <Button onClick={submit} loading={create.isPending} disabled={!resumeId || !jobId} className="w-full">
          Create workspace
        </Button>
      </div>
    </Modal>
  );
}
