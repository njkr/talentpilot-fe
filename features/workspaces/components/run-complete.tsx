"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { H2, Body } from "@/components/ui/typography";
import { FadeIn } from "@/components/motion";

export function RunComplete({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();

  useEffect(() => {
    // Auto-advance to the full workspace view (Sprint 6) after a beat so the "complete" state registers.
    const t = setTimeout(() => router.replace(`/workspaces/${workspaceId}`), 1200);
    return () => clearTimeout(t);
  }, [workspaceId, router]);

  return (
    <Card className="text-center py-10">
      <FadeIn>
        <CheckCircleIcon className="mx-auto h-12 w-12 text-success" />
        <H2 className="mt-3">Analysis complete</H2>
        <Body className="mt-1">Taking you to your results…</Body>
      </FadeIn>
    </Card>
  );
}
