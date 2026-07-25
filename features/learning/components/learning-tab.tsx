"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { H3, Body } from "@/components/ui/typography";
import { useLearningRoadmap } from "../hooks/use-learning-roadmap";
import { LearningCard } from "./learning-card";

export function LearningTab({ workspaceId, active }: { workspaceId: string; active: boolean }) {
  const { data, isLoading } = useLearningRoadmap(workspaceId, active);

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!data?.items.length) return <EmptyState title="No skill gaps found" description="Your resume already covers this job's requirements." />;

  const totalHours = data.items.reduce((n, i) => n + i.estHours, 0);

  return (
    <div className="space-y-4">
      <Card>
        <H3>Close your skill gaps</H3>
        <Body className="mt-1">
          {data.items.length} focused resources · about {totalHours} hours total
        </Body>
      </Card>

      <div className="space-y-3">
        {data.items.map((item, i) => (
          <LearningCard key={i} item={item} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
