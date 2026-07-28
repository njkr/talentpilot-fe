import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Same "Compass Point" mark as components/layout/logo.tsx, re-derived here because next/og's
// renderer (Satori) doesn't support CSS clip-path, and the classic border-triangle hack (transparent
// left/right borders + solid bottom) rendered as a plain diamond instead of a triangle — Satori
// doesn't collapse the zero-size box the way browsers do. Inline SVG (an upward triangle rotated via
// the SVG transform attribute, not CSS) is what Satori actually supports correctly.
export default function Icon() {
  const s = size.width;
  const radius = s * 0.22;

  return new ImageResponse(
    (
      <div style={{ width: s, height: s, borderRadius: radius, background: "#2563eb", display: "flex" }}>
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${s / 2},${s * 0.28} ${s * 0.72},${s * 0.72} ${s * 0.28},${s * 0.72}`} fill="white" transform={`rotate(45 ${s / 2} ${s / 2})`} />
          <circle cx={s * 0.265} cy={s * 0.735} r={s * 0.068} fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
