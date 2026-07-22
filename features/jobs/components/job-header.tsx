import type { PropsWithChildren } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { H1, Body } from "@/components/ui/typography";
import { JobActions } from "./job-actions";
import type { JobDescription } from "../job.types";

export function JobHeader({ jd }: { jd: JobDescription }) {
  const p = jd.parsedData;
  return (
    <div>
      <Link href="/jobs" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" />
        Jobs
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <H1>{jd.position ?? "Job description"}</H1>
          {jd.company && <Body>{jd.company}</Body>}
        </div>
        <JobActions jd={jd} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {p?.seniority && p.seniority !== "unknown" && <MetaChip>{p.seniority}</MetaChip>}
        {p?.remoteType && p.remoteType !== "unknown" && <MetaChip>{p.remoteType}</MetaChip>}
        {jd.experienceRequired && <MetaChip>{jd.experienceRequired}</MetaChip>}
        {jd.employmentType && <MetaChip>{jd.employmentType}</MetaChip>}
      </div>
    </div>
  );
}

const MetaChip = ({ children }: PropsWithChildren) => <span className="rounded-md bg-bg px-2.5 py-1 text-xs font-medium text-ink-secondary capitalize">{children}</span>;
