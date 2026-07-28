import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site-config";
import { ScoreDemo } from "../../components/score-demo";
import { FAQ } from "../../components/faq";
import { FinalCTA } from "../../components/final-cta";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker — Score Your Resume Instantly",
  description:
    "Check how your resume scores against any job's ATS in seconds. See exactly which keywords " +
    "you're missing and how to fix them. Free ATS resume checker by TalentPilot.",
  alternates: { canonical: `${SITE_URL}/ats-resume-checker` },
};

export default function AtsResumeCheckerPage() {
  return (
    <div>
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Free ATS resume checker
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-secondary">
            Most large companies filter resumes with an Applicant Tracking System before a human ever
            sees them. TalentPilot scores your resume the way an ATS does — keyword by keyword — so
            you know exactly what to fix before you apply.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/register">Check my resume free</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-ink-muted">Free to start · No credit card required</p>
        </div>
      </section>

      <ScoreDemo />

      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-ink">What does an ATS resume checker actually check?</h2>
          <div className="mt-6 space-y-4 text-ink-secondary">
            <p>
              An ATS parses your resume into structured fields and compares it against the job
              posting&apos;s requirements — matching skills, titles, and keywords. A resume that
              reads well to a person can still score poorly if it&apos;s missing the specific terms
              the job posting uses.
            </p>
            <p>
              TalentPilot runs the same kind of check, then shows you precisely which required and
              preferred keywords are matched and which are missing — not just a single opaque score.
            </p>
          </div>
        </div>
      </section>

      <FAQ />
      <FinalCTA />
    </div>
  );
}
