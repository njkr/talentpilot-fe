"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ChartBarIcon, QueueListIcon, CommandLineIcon, ClipboardDocumentListIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { H1, H3, Caption } from "@/components/ui/typography";
import { useAdminCosts } from "../hooks/use-admin";
import { AdminQueryBoundary } from "./admin-query-boundary";

export function AdminOverview() {
  const { data, isLoading, error } = useAdminCosts(7);
  const weekTotal = data?.byDay.reduce((n, d) => n + Number(d.costUsd), 0) ?? 0;

  return (
    <div className="space-y-6">
      <H1>Operations</H1>

      <AdminQueryBoundary error={error}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Caption>AI spend (7d)</Caption>
            {isLoading ? <Skeleton className="mt-1 h-8 w-24" /> : <p className="mt-1 font-mono text-2xl font-bold text-ink">${weekTotal.toFixed(2)}</p>}
          </Card>
          <RunLookupCard />
        </div>
      </AdminQueryBoundary>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/admin/costs" label="Cost dashboard" icon={ChartBarIcon} />
        <QuickLink href="/admin/queues" label="Dead-letter queue" icon={QueueListIcon} />
        <QuickLink href="/admin/prompts" label="Prompt versions" icon={CommandLineIcon} />
        <QuickLink href="/admin/audit" label="Audit log" icon={ClipboardDocumentListIcon} />
      </div>
    </div>
  );
}

// There's no "list active runs" endpoint (only GET /admin/runs/:id, a single lookup) — an operator
// reaches a specific run from a support ticket or the workspace's own URL, so a paste-a-run-id
// jump box is the whole "browse" affordance this surface has.
function RunLookupCard() {
  const [runId, setRunId] = useState("");
  const router = useRouter();

  return (
    <Card>
      <Caption>Inspect a run</Caption>
      <form
        className="mt-1.5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (runId.trim()) router.push(`/admin/runs/${runId.trim()}`);
        }}
      >
        <Input value={runId} onChange={(e) => setRunId(e.target.value)} placeholder="Run ID" aria-label="Run ID" className="h-9" />
        <Button type="submit" size="sm" disabled={!runId.trim()}>
          Go
        </Button>
      </form>
    </Card>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return (
    <Link href={href}>
      <Card className="flex items-center justify-between transition-colors hover:bg-bg">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-ink-secondary" />
          <H3>{label}</H3>
        </div>
        <ArrowRightIcon className="h-4 w-4 text-ink-muted" />
      </Card>
    </Link>
  );
}
