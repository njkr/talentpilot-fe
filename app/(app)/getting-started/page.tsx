"use client";

import { useRouter } from "next/navigation";
import { H1, Body } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { UploadDropzone } from "@/features/resumes/components/upload-dropzone";

// One-time stop between email verification and the dashboard (see useVerifyEmail's onSuccess) —
// there's no anonymous/pre-auth resume upload endpoint, so this has to come AFTER verification,
// not before registration. Skippable — the dashboard's own FirstRunEmptyState already re-prompts
// on any later visit for an account with zero resumes, so skipping here isn't a dead end.
export default function GettingStartedPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <div className="text-center">
        <H1>Welcome to TalentPilot</H1>
        <Body className="mt-1">Upload your resume to get started — we&apos;ll use it to score and tailor your applications.</Body>
      </div>

      <Card>
        <UploadDropzone onUploaded={() => router.push("/dashboard")} />
      </Card>

      <div className="text-center">
        <button onClick={() => router.push("/dashboard")} className="text-sm text-ink-secondary hover:text-ink">
          Skip for now
        </button>
      </div>
    </div>
  );
}
