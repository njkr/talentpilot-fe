import { cn } from "@/lib/utils";

interface LogoProps {
  /** Icon badge size in px. Default 28 matches the sidebar/topbar usage. */
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

// "Compass Point" mark — a directional needle + counterweight dot in a rounded-square badge,
// from the approved brand design. Proportions are scaled off that design's own per-size
// examples (16/28/32/44/56/88px) rather than hardcoded per breakpoint, since real usage here spans
// sizes the design doc didn't enumerate (e.g. the landing page hero). The dot drops below 20px,
// matching the design's own choice to omit it at its smallest (16px) example — illegible at that
// scale otherwise.
export function Logo({ size = 28, showWordmark = true, wordmarkClassName, className }: LogoProps) {
  const needle = size * 0.43;
  const offset = Math.max(1, size * 0.035);
  const dot = size * 0.136;
  const dotPos = size * 0.193;
  const radius = size * 0.22;
  const showDot = size >= 20;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center bg-primary"
        style={{ width: size, height: size, borderRadius: radius }}
        aria-hidden="true"
      >
        <span
          className="bg-white"
          style={{
            width: needle,
            height: needle,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            transform: `rotate(45deg) translate(${offset}px, -${offset}px)`,
          }}
        />
        {showDot && (
          <span className="absolute rounded-full bg-white" style={{ width: dot, height: dot, left: dotPos, bottom: dotPos }} />
        )}
      </span>
      {showWordmark ? (
        <span className={cn("font-display font-bold tracking-tight text-ink", wordmarkClassName)}>
          Talent<span className="text-primary">Pilot</span>
        </span>
      ) : (
        // Icon-only usage (e.g. a collapsed sidebar) still needs an accessible name.
        <span className="sr-only">TalentPilot</span>
      )}
    </span>
  );
}
