import Link from "next/link";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <H1>Page not found</H1>
      <Body>The page you&apos;re looking for doesn&apos;t exist or may have moved.</Body>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}
