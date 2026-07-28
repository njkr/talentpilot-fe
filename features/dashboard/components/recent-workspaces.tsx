import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { DashboardData } from "../dashboard.api";

export function RecentWorkspaces({ items }: { items: DashboardData["workspaces"]["recent"] }) {
  if (!items.length) return null;
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <H3>Recent workspaces</H3>
        <Link href="/workspaces" className="text-sm text-primary">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {items.map((ws) => (
          <Link key={ws.id} href={`/workspaces/${ws.id}`} className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 hover:bg-bg">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{ws.name}</span>
            <div className="flex items-center gap-3">
              {/* The score the user actually cares about, colored by band, not just the status. */}
              {ws.score != null && (
                <span className={cn("text-sm font-semibold", ws.score >= 80 ? "text-success" : ws.score >= 60 ? "text-primary" : "text-warning")}>{ws.score}</span>
              )}
              <StatusBadge status={ws.status} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
