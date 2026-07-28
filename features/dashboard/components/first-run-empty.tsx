import Link from "next/link";
import { ArrowUpTrayIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

// EmptyState's `action` prop only takes a single {label, href|onClick} — not arbitrary JSX — so
// the two starting points here render as a manual row below it rather than misusing that prop
// with two buttons (an actual type mismatch in the sprint doc's own version of this component).
export function FirstRunEmptyState() {
  return (
    <Card className="py-10">
      <EmptyState title="Let's run your first analysis" description="Upload a resume and a job description, then run a full analysis to see your ATS score, suggestions, and more." />
      <div className="mt-2 flex justify-center gap-2">
        <Button asChild icon={ArrowUpTrayIcon}>
          <Link href="/resumes">Upload a resume</Link>
        </Button>
        <Button asChild variant="secondary" icon={BriefcaseIcon}>
          <Link href="/jobs">Add a job</Link>
        </Button>
      </div>
    </Card>
  );
}
