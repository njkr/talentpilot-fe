import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-ink">Ready to see your score?</h2>
        <p className="mt-3 text-ink-secondary">
          Free to start. No credit card. Your first analysis is ready in under a minute.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/register">Check my resume free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
