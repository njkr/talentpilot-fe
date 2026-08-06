"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { useUploadResume } from "../hooks/use-upload-resume";
import { ApiError } from "@/lib/api/error";
import { useUiStore } from "@/stores/ui.store";
import type { Resume } from "../resume.types";

// Exported so the onboarding wizard's capture-only (no upload yet) dropzone step uses identical
// accept/size rules without re-declaring the literals.
export const ACCEPTED_MIME_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export const MAX_BYTES = 10 * 1024 * 1024;

interface UploadDropzoneProps {
  onUploaded?: (resume: Resume) => void;
}

export function UploadDropzone({ onUploaded }: UploadDropzoneProps = {}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const upload = useUploadResume();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);

  const handleFile = (file: File) => {
    setLocalError(null);
    upload.mutate(file, {
      onSuccess: onUploaded,
      onError: (err) => {
        if (!(err instanceof ApiError)) return;
        // Real codes per the backend's ErrorCode enum — PLAN_LIMIT_REACHED (max resume slots) ->
        // the shared upgrade modal. The FILE_* codes are the server's real magic-byte/content checks.
        if (err.code === "PLAN_LIMIT_REACHED") {
          openUpgradeModal(err.details);
          return;
        }
        if (err.code === "FILE_TOO_LARGE") {
          const maxMb = err.details?.maxMb as number | undefined;
          setLocalError(maxMb ? `File must be under ${maxMb}MB.` : "File is too large.");
          return;
        }
        if (err.code === "FILE_TYPE_UNSUPPORTED") {
          setLocalError("Upload a PDF or DOCX file.");
          return;
        }
        if (err.code === "FILE_UNREADABLE") {
          setLocalError("This looks like a scanned or image-only PDF. Upload a text-based PDF or a DOCX file.");
          return;
        }
        if (err.code === "FILE_CORRUPT") {
          setLocalError("This file appears to be damaged. Try re-exporting it and uploading again.");
          return;
        }
        setLocalError(err.message);
      },
    });
  };

  return (
    <FileDropzone
      accept=".pdf,.docx"
      acceptedMimeTypes={ACCEPTED_MIME_TYPES}
      maxBytes={MAX_BYTES}
      pending={upload.isPending}
      error={localError}
      label="Drop your resume here, or click to browse"
      helper="PDF or DOCX, up to 10MB"
      onFile={handleFile}
      onValidationError={setLocalError}
    />
  );
}
