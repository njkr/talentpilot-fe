import {
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ShieldCheckIcon,
    title: "No fabricated experience",
    desc:
      "Unlike generic AI, TalentPilot checks every suggestion against your real resume in code — " +
      "it never invents metrics, jobs, or credentials you'd have to defend in an interview.",
  },
  {
    icon: ChartBarIcon,
    title: "Real ATS scoring",
    desc: "A transparent score across weighted factors — see exactly why you got it and what to fix.",
  },
  {
    icon: DocumentTextIcon,
    title: "Tailored cover letters",
    desc: "A cover letter grounded in your actual experience and the specific job, in your chosen tone.",
  },
  {
    icon: AcademicCapIcon,
    title: "Interview prep & salary insights",
    desc: "Practice questions from your real background, company research, and a salary range for the role.",
  },
];

export function FeatureShowcase() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-ink">Everything a strong application needs</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <f.icon className="h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-secondary">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
