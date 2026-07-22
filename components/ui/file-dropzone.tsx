"use client";

import { useState, useRef } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Spinner } from "./spinner";
import { Body, Caption } from "./typography";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: string; // input's `accept` attribute, e.g. ".pdf,.docx"
  acceptedMimeTypes: string[];
  maxBytes: number;
  pending: boolean;
  error: string | null;
  label: string;
  helper: string;
  pendingLabel?: string;
  onFile: (file: File) => void;
  onValidationError: (message: string) => void;
}

// Generic drag-drop + click-to-browse file input. Feature code owns the mutation, error-code
// mapping, and copy; this owns the interaction (drag state, keyboard activation, the
// select-same-file-twice gotcha) so it isn't rebuilt per upload flow.
export function FileDropzone({ accept, acceptedMimeTypes, maxBytes, pending, error, label, helper, pendingLabel = "Uploading…", onFile, onValidationError }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Client-side pre-check for instant feedback. The SERVER's magic-byte check is the real
    // gate — a renamed .exe passes these checks but the backend rejects it. This is UX, not security.
    if (!acceptedMimeTypes.includes(file.type)) {
      onValidationError(`Only ${accept.replace(/\./g, "").toUpperCase()} files are supported.`);
      return;
    }
    if (file.size > maxBytes) {
      onValidationError(`File must be under ${Math.round(maxBytes / (1024 * 1024))}MB.`);
      return;
    }
    onFile(file);
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
        {pending ? (
          <>
            <Spinner className="h-6 w-6 text-primary" />
            <Body>{pendingLabel}</Body>
          </>
        ) : (
          <>
            <ArrowUpTrayIcon className="h-8 w-8 text-ink-muted" />
            <div>
              <p className="text-sm font-medium text-ink">{label}</p>
              <Caption>{helper}</Caption>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = ""; // without this, selecting the same file twice fires no change event
          }}
        />
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
