"use client";

import { Card } from "@/components/ui/card";
import { H2, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

// Scoped to the (app) segment — the layout above this (AppShell/RequireAuth) stays mounted, so a
// crash on one page doesn't take the whole nav/topbar down with it.
export default function AppSegmentError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="mx-auto mt-12 max-w-md text-center">
      <H2>This page hit a problem</H2>
      <Body className="mt-1 mb-4">Something went wrong loading this screen. You can try again.</Body>
      <Button onClick={reset}>Try again</Button>
    </Card>
  );
}
