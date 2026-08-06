import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { H3 } from "@/components/ui/typography";
import { cn, timeAgo } from "@/lib/utils";
import type { DashboardData } from "../dashboard.api";

// Compact table, same markup convention as features/admin/components/run-inspector.tsx
// (overflow-x-auto wrapper, text-xs header row, divide-y body) rather than the old link-list.
export function RecentWorkspaces({ items }: { items: DashboardData["workspaces"]["recent"] }) {
  if (!items.length) return null;
  return (
    <Card className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <H3>Recent workspaces</H3>
        <Link href="/workspaces" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-ink-secondary">
              <th className="pb-2 font-medium">Workspace</th>
              <th className="pb-2 font-medium text-right">Score</th>
              <th className="pb-2 font-medium text-right">Status</th>
              <th className="pb-2 font-medium text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((ws) => (
              <tr key={ws.id} className="group hover:bg-bg">
                {/* max-w-0 + w-full is the standard trick for a truncating table cell without
                    table-layout:fixed — without it, `truncate`'s white-space:nowrap has no bound
                    to clip against, so the cell (and the whole table/card/page) grows to fit the
                    full untruncated name instead of actually truncating. */}
                <td className="max-w-0 w-full py-2.5">
                  <Link href={`/workspaces/${ws.id}`} className="block truncate font-medium text-ink group-hover:text-primary">
                    {ws.name}
                  </Link>
                </td>
                <td className="py-2.5 text-right">
                  {ws.score != null ? (
                    <span className={cn("font-semibold", ws.score >= 80 ? "text-success" : ws.score >= 60 ? "text-primary" : "text-warning")}>{ws.score}</span>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <StatusBadge status={ws.status} />
                </td>
                <td className="py-2.5 text-right text-xs whitespace-nowrap text-ink-secondary">{timeAgo(ws.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
