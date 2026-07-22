import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { H3, Body } from "@/components/ui/typography";
import { useRetryJob } from "../hooks/use-retry-job";
import type { JobDescription } from "../job.types";

export function JobFailedCard({ jd }: { jd: JobDescription }) {
  const retry = useRetryJob();
  return (
    <Card>
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-danger shrink-0 mt-0.5" />
        <div className="flex-1">
          <H3>We couldn&apos;t analyze this job description</H3>
          <Body className="mt-1">{jd.parseError ?? "The file could not be read."}</Body>
          <Button variant="secondary" className="mt-3" onClick={() => retry.mutate(jd.id)} loading={retry.isPending}>
            Try again
          </Button>
        </div>
      </div>
    </Card>
  );
}
