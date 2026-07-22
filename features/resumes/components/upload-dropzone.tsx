"use client";

import { useState, useRef } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/ui/spinner";
import { Body, Caption } from "@/components/ui/typography";
import { useUploadResume } from "../hooks/use-upload-resume";
import { ApiError } from "@/lib/api/error";
import { useUiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

const ACCEPTED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_BYTES = 10 * 1024 * 1024;

export function UploadDropzone() {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadResume();
  const openUpgradeModal = useUiStore((s) => s.openUpgradeModal);

  const handleFile = (file: File) => {
    setLocalError(null);
    // Client-side pre-check for instant feedback. The SERVER's magic-byte check is the real
    // gate — a renamed .exe passes these checks but the backend rejects it. This is UX, not security.
    if (!ACCEPTED.includes(file.type)) {
      setLocalError("Only PDF and DOCX files are supported.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("File must be under 10MB.");
      return;
    }

    upload.mutate(file, {
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
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
          "px-6 py-12 text-center cursor-pointer transition-colors",
          dragging ? "border-primary bg-primary/3" : "border-border hover:border-ink-muted",
        )}
      >
        {upload.isPending ? (
          <>
            <Spinner className="h-6 w-6 text-primary" />
            <Body>Uploading…</Body>
          </>
        ) : (
          <>
            <ArrowUpTrayIcon className="h-8 w-8 text-ink-muted" />
            <div>
              <p className="text-sm font-medium text-ink">Drop your resume here, or click to browse</p>
              <Caption>PDF or DOCX, up to 10MB</Caption>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = ""; // without this, selecting the same file twice fires no change event
          }}
        />
      </div>
      {localError && <p className="mt-2 text-sm text-danger">{localError}</p>}
    </div>
  );
}
