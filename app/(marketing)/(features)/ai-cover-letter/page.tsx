import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SITE_URL } from "@/lib/site-config";
import { FAQ } from "../../components/faq";
import { FinalCTA } from "../../components/final-cta";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator — Tailored, Never Fabricated",
  description:
    "Generate a cover letter tailored to your resume and the specific job — grounded in your real " +
    "experience, checked in code so it never invents a job, credential, or metric you don't have.",
  alternates: { canonical: `${SITE_URL}/ai-cover-letter` },
};

export default function AiCoverLetterPage() {
  return (
    <div>
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            AI cover letters that never make things up
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-secondary">
            A generic AI chatbot will happily invent an achievement to make your cover letter sound
            better. TalentPilot won&apos;t — every generated letter is checked in code against your
            actual resume before you ever see it.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/register">Try it free</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-card px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <Card className="flex items-start gap-4">
            <ShieldCheckIcon className="h-8 w-8 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-ink">How the fabrication check works</h2>
              <p className="mt-2 text-sm text-ink-secondary">
                Every number, employer, project, and credential in a generated letter is verified
                against your real resume text before it&apos;s shown to you. If the model writes
                something it can&apos;t back up — an invented metric, a job you never had — that
                draft is rejected and regenerated, never silently shown as-is.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <FAQ />
      <FinalCTA />
    </div>
  );
}
