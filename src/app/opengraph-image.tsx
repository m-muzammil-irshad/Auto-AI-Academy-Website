import { ImageResponse } from "next/og";

// Share image shown when a link to the site is posted on WhatsApp, Facebook,
// LinkedIn or X. Generated at build time, so there is no image file to maintain.
// Edge runtime: the Node version fails on Windows when the project path contains spaces.
export const runtime = "edge";
export const alt ="Auto AI Academy: free AI, Python and automation courses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #7e22ce 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>Auto AI Academy</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>
            Learn AI, Python &amp; Automation
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 38, color: "#c7d2fe" }}>
            100% free courses with assignments and certificates
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#e0e7ff" }}>
          For learners in Pakistan and India
        </div>
      </div>
    ),
    size
  );
}
