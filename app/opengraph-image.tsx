import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build/request time from JSX — no static asset needed. Recreates the Logo
// component's "Compass Point" mark inline (ImageResponse can't import React components that use
// DOM/CSS custom properties, only plain inline styles) using the same real brand hex values from
// app/globals.css's @theme block, not invented colors.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "16px solid transparent",
                borderRight: "16px solid transparent",
                borderBottom: "28px solid white",
                transform: "rotate(45deg)",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#111827" }}>
            Talent<span style={{ color: "#2563eb" }}>Pilot</span>
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 40, fontWeight: 700, color: "#111827" }}>
          Beat the ATS. Land more interviews.
        </div>
      </div>
    ),
    { ...size },
  );
}
