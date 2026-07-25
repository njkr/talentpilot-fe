"use client";

import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <H1>Something went wrong</H1>
      <Body>An unexpected error occurred. You can try again, or come back later.</Body>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
