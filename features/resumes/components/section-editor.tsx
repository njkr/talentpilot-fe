"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdateSection } from "../hooks/use-update-section";
import type { ResumeSection, SummaryContent } from "../resume.types";

interface SectionEditorProps {
  resumeId: string;
  section: ResumeSection;
  onDone: () => void;
}

// For simple text sections (summary), a textarea. Structured sections (experience, education,
// ...) aren't editable inline yet — a fuller field-by-field editor is a later refinement, out of
// this sprint's scope.
export function SectionEditor({ resumeId, section, onDone }: SectionEditorProps) {
  const update = useUpdateSection(resumeId);
  const [text, setText] = useState(section.sectionType === "summary" ? (section.content as SummaryContent).text : "");

  const save = () => {
    const content = section.sectionType === "summary" ? { text } : section.content;
    update.mutate({ type: section.sectionType, content }, { onSuccess: onDone });
  };

  return (
    <div className="space-y-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      <div className="flex gap-2">
        <Button size="sm" onClick={save} loading={update.isPending}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
