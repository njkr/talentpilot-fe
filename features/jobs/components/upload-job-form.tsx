"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { useUploadJob } from "../hooks/use-analyze-job";
import { ApiError } from "@/lib/api/error";
import { useUiStore } from "@/stores/ui.store";

const ACCEPTED_MIME_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_BYTES = 10 * 1024 * 1024;

export function UploadJobForm() {
  const [localError, setLocalError] = useState<string | null>(null);
  const upload = useUploadJob();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);

  const handleFile = (file: File) => {
    setLocalError(null);
    upload.mutate(file, {
      onError: (err) => {
        if (!(err instanceof ApiError)) return;
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
      label="Drop the job posting file here, or click to browse"
      helper="PDF or DOCX, up to 10MB"
      pendingLabel="Uploading and analyzing…"
      onFile={handleFile}
      onValidationError={setLocalError}
    />
  );
}
