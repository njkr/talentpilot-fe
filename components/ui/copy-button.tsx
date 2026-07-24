"use client";

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={copy}>
      {copied ? <CheckIcon className="h-4 w-4 text-success" /> : <ClipboardIcon className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
