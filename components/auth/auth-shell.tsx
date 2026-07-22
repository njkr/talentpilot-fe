import type { ReactNode } from "react";
import { H2, Body } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/motion";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// The card wrapper every auth screen shares.
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <FadeIn className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mb-6 text-xl font-bold text-primary">TalentPilot</div>
        <H2>{title}</H2>
        {subtitle && <Body className="mt-1">{subtitle}</Body>}
      </div>
      <Card>{children}</Card>
    </FadeIn>
  );
}
