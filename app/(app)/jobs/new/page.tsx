"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { H1, Body } from "@/components/ui/typography";
import { Tabs } from "@/components/ui/tabs";
import { PasteJobForm } from "@/features/jobs/components/paste-job-form";
import { UploadJobForm } from "@/features/jobs/components/upload-job-form";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/jobs" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-ink">
          <ArrowLeftIcon className="h-4 w-4" />
          Jobs
        </Link>
        <H1>Add a job description</H1>
        <Body>Paste the posting or upload a file.</Body>
      </div>

      <Tabs
        items={[
          { value: "paste", label: "Paste text", content: <PasteJobForm /> },
          { value: "upload", label: "Upload file", content: <UploadJobForm /> },
        ]}
      />
    </div>
  );
}
