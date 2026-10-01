"use client";

import { EnvelopeIcon, ShareIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { H1, Body, Caption } from "@/components/ui/typography";
import { useReferralInfo } from "../hooks/use-referrals";

export function InvitePage() {
  const { data, isLoading } = useReferralInfo();

  if (isLoading || !data) return <Skeleton className="h-64 rounded-xl" />;

  if (!data.enabled) {
    return <EmptyState title="Invites aren't available right now" description="Check back later." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <H1>Give {data.rewardPerReferral} credits, get {data.rewardPerReferral}</H1>
        <Body className="mt-2">Invite a friend. When they run their first analysis, you both earn credits.</Body>
      </div>

      <Card>
        <Caption className="mb-1.5 block">Your invite link</Caption>
        <div className="flex gap-2">
          <Input readOnly value={data.shareUrl} className="font-mono text-xs" />
          <CopyButton text={data.shareUrl} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ShareButton url={data.shareUrl} channel="email" />
          <ShareButton url={data.shareUrl} channel="linkedin" />
          <ShareButton url={data.shareUrl} channel="whatsapp" />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Invited" value={data.stats.invited} />
        <Stat label="Joined" value={data.stats.qualified} />
        <Stat label="Credits earned" value={data.stats.creditsEarned} accent />
      </div>

      <Caption className="block text-center">You&apos;ll earn credits once someone you invite runs their first analysis.</Caption>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <Card className="text-center">
      <p className={accent ? "text-2xl font-bold text-primary" : "text-2xl font-bold text-ink"}>{value}</p>
      <Caption>{label}</Caption>
    </Card>
  );
}

function ShareButton({ url, channel }: { url: string; channel: "email" | "linkedin" | "whatsapp" }) {
  const text = encodeURIComponent("I've been using TalentPilot to tailor my job applications — try it:");
  const u = encodeURIComponent(url);
  const href = {
    email: `mailto:?subject=${text}&body=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: `https://wa.me/?text=${text}%20${u}`,
  }[channel];
  const label = { email: "Email", linkedin: "LinkedIn", whatsapp: "WhatsApp" }[channel];
  // Heroicons is an outline icon SET, not a brand-logo library (DEVELOPMENT-NOTES.md's "no non-Heroicons
  // icons" rule) — LinkedIn/WhatsApp get the closest generic concept (share / chat) rather than a
  // fabricated brand mark.
  const Icon = { email: EnvelopeIcon, linkedin: ShareIcon, whatsapp: ChatBubbleLeftRightIcon }[channel];
  return (
    <Button asChild variant="secondary" size="sm" icon={Icon}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </Button>
  );
}
