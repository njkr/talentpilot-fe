"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import { resumeApi } from "@/features/resumes/resume.api";
import { jobApi } from "@/features/jobs/job.api";
import { useCredits } from "@/features/credits/credits.hooks";
import { useCreateWorkspace } from "../hooks/use-create-workspace";
import { ResumePicker } from "./resume-picker";
import { JobPicker } from "./job-picker";
import { MatchPreview } from "./match-preview";
import { ANALYZE_COST } from "./analyze-button";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
  const { data: resumes } = useQuery({ queryKey: ["resumes"], queryFn: () => resumeApi.list(), enabled: open });
  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: () => jobApi.list(), enabled: open });
  const { data: credits } = useCredits();
  const create = useCreateWorkspace();
  const router = useRouter();

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");

  const allResumes = resumes?.data ?? [];
  const allJobs = jobs?.data ?? [];
  const selectedJob = allJobs.find((j) => j.id === jobId);
  const balance = credits?.balance ?? 0;
  const lowBalance = balance < ANALYZE_COST;

  const submit = () => {
    if (!resumeId || !selectedJob) return;
    create.mutate(
      { resumeId, jobDescriptionId: jobId, name: `${selectedJob.company ?? "Job"} — ${selectedJob.position ?? "Role"}` },
      {
        onSuccess: (workspace) => {
          setResumeId("");
          setJobId("");
          onClose();
          // Straight to the workspace where Analyze lives — removes a click for the common case
          // (a strong-match pair the user is about to analyze anyway).
          router.push(`/workspaces/${workspace.id}`);
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="New analysis" className="max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="space-y-4">
        <ResumePicker resumes={allResumes} value={resumeId} onChange={setResumeId} />
        <JobPicker jobs={allJobs} value={jobId} onChange={setJobId} />
        <MatchPreview resumeId={resumeId || null} jobDescriptionId={jobId || null} />
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 space-y-2 border-t border-border bg-card px-6 py-4">
        <Caption className="block">
          Analyzing this will cost {ANALYZE_COST} credits — you have {balance} (~{Math.floor(balance / ANALYZE_COST)} analyses).
        </Caption>
        {lowBalance && (
          <Caption className="block text-warning">
            Low balance —{" "}
            <Link href="/billing" className="text-primary hover:underline">
              top up
            </Link>{" "}
            before analyzing.
          </Caption>
        )}
        <Button onClick={submit} loading={create.isPending} disabled={!resumeId || !jobId} className="w-full">
          Create workspace
        </Button>
        {(!resumeId || !jobId) && <Caption className="block text-center">Select a resume and job description to continue.</Caption>}
      </div>
    </Modal>
  );
}
