import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Caption } from "@/components/ui/typography";
import { JobStatusBadge } from "./job-status-badge";
import { displayPosition, type JobDescription } from "../job.types";

export function JobCard({ jd }: { jd: JobDescription }) {
  const p = jd.parsedData;
  return (
    <Card className="hover:border-ink-muted transition-colors">
      <Link href={`/jobs/${jd.id}`} className="block">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">{displayPosition(jd)}</p>
            <Caption>{jd.company ?? "Unknown company"}</Caption>
          </div>
          {jd.status !== "analyzed" && <JobStatusBadge status={jd.status} />}
        </div>
        {p && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.seniority && p.seniority !== "unknown" && <MetaChip>{p.seniority}</MetaChip>}
            {p.remoteType && p.remoteType !== "unknown" && <MetaChip>{p.remoteType}</MetaChip>}
          </div>
        )}
      </Link>
    </Card>
  );
}

const MetaChip = ({ children }: { children: React.ReactNode }) => <span className="rounded-md bg-bg px-2 py-0.5 text-xs font-medium text-ink-secondary capitalize">{children}</span>;
