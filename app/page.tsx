import Link from "next/link";
import { H1, Body } from "@/components/ui/typography";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <H1>TalentPilot</H1>
      <Body>Foundation is in place — see the component kit.</Body>
      <Link href="/kit" className="text-sm font-medium text-primary hover:text-primary-hover">
        View the design system →
      </Link>
    </main>
  );
}
