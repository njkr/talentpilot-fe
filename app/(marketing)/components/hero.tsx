import Link from "next/link";
import { Button } from "@/components/ui/button";

// The single most important block on the page — the one <h1>, carrying both the primary keyword
// ("ATS") and the emotional hook (the fear it targets). The subhead names the anti-fabrication
// guarantee, the real differentiator over generic AI tools. This is where most conversion is won
// or lost, so it stays plain server HTML with no client-side animation delaying its paint.
export function Hero() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Beat the ATS.
          <br />
          <span className="text-primary">Land more interviews.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-secondary">
          TalentPilot scores your resume against any job, rewrites it with AI — without inventing
          experience you don&apos;t have — and writes a tailored cover letter. All in one click.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/register">Check my resume free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-ink-muted">
          Free to start · No credit card · Your first analysis in under a minute
        </p>
      </div>
    </section>
  );
}
