import { cn } from "@/lib/utils";
import type { MatchBandTier } from "./match-band-badge";

const BAND_LABEL: Record<MatchBandTier, string> = {
  low: "Low match",
  fair: "Fair match",
  strong: "Strong match",
};

// Semicircle gauge, zones fixed at the same 35%/70% cutoffs classifyMatchRatio uses — only the
// needle rotation varies per instance. Colors come straight from the app's existing
// danger/warning/success tokens (same ones MatchBandBadge already uses), not a new palette.
export function MatchGauge({ ratio, band, label, className }: { ratio: number; band: MatchBandTier; label?: string; className?: string }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const needleDeg = 180 * clamped - 90;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg viewBox="0 0 200 112" className="w-full max-w-[10rem]" aria-hidden="true">
        <path d="M 20 100 A 80 80 0 0 1 63.68 28.72" fill="none" strokeWidth={11} strokeLinecap="round" className="stroke-danger opacity-85" />
        <path d="M 63.68 28.72 A 80 80 0 0 1 147.04 35.28" fill="none" strokeWidth={11} strokeLinecap="round" className="stroke-warning opacity-85" />
        <path d="M 147.04 35.28 A 80 80 0 0 1 180 100" fill="none" strokeWidth={11} strokeLinecap="round" className="stroke-success opacity-85" />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="32"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="stroke-ink transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${needleDeg}deg)`, transformOrigin: "100px 100px" }}
        />
        <circle cx="100" cy="100" r="4.5" className="fill-ink" />
      </svg>
      <span className="text-sm font-semibold text-ink">{BAND_LABEL[band]}</span>
      {label && <span className="text-xs text-ink-muted">{label}</span>}
    </div>
  );
}
