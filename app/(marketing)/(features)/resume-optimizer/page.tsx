import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site-config";
import { HowItWorks } from "../../components/how-it-works";
import { FAQ } from "../../components/faq";
import { FinalCTA } from "../../components/final-cta";

export const metadata: Metadata = {
  title: "AI Resume Optimizer — Tailor Your Resume to Any Job",
  description:
    "TalentPilot rewrites your resume's bullet points to match a specific job's keywords and " +
    "requirements — every suggestion checked against your real experience, never fabricated.",
  alternates: { canonical: `${SITE_URL}/resume-optimizer` },
};

export default function ResumeOptimizerPage() {
  return (
    <div>
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Tailor your resume to any job
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-secondary">
            Paste a job posting and TalentPilot rewrites your resume&apos;s bullet points to match its
            keywords and requirements — grounded in what you actually did, not what would sound
            impressive.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/register">Optimize my resume</Link>
            </Button>
          </div>
        </div>
      </section>

      <HowItWorks />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
