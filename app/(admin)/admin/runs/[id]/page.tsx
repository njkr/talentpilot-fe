"use client";

import { Suspense, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RunInspector } from "@/features/admin/components/run-inspector";

export default function RunInspectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
      <RunInspector runId={id} />
    </Suspense>
  );
}
