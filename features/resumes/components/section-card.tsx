"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { H3, Caption } from "@/components/ui/typography";
import { Tooltip } from "@/components/ui/tooltip";
import { SectionView } from "./section-view";
import { SectionEditor } from "./section-editor";
import { sectionLabels, type ResumeSection } from "../resume.types";

// Only `summary` has an inline editor today (a plain text field). Showing an Edit affordance on a
// structured section (experience, education, ...) would let a user "save" with nothing actually
// changed, which still sets editedByUser:true and locks it from a future re-parse for no reason.
const EDITABLE_TYPES = new Set(["summary"]);

export function SectionCard({ resumeId, section }: { resumeId: string; section: ResumeSection }) {
  const [editing, setEditing] = useState(false);
  const lowConfidence = section.confidence < 0.6;
  const editable = EDITABLE_TYPES.has(section.sectionType);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <H3>{sectionLabels[section.sectionType]}</H3>
          {/* Flag low-confidence sections for the user to double-check. */}
          {lowConfidence && (
            <Tooltip content="The AI was less certain here — worth a quick check">
              <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Check this</span>
            </Tooltip>
          )}
          {section.editedByUser && <Caption>edited</Caption>}
        </div>
        {editable && !editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      {editing ? <SectionEditor resumeId={resumeId} section={section} onDone={() => setEditing(false)} /> : <SectionView section={section} />}
    </Card>
  );
}
