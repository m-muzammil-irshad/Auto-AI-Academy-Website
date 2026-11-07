/**
 * Generates an SVG shimmer effect for Next.js Image blurDataURL.
 * Renders instantly from memory without any network request.
 */
function shimmer(w: number, h: number): string {
  return `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e2235" offset="20%" />
      <stop stop-color="#2a3048" offset="50%" />
      <stop stop-color="#1e2235" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e2235" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`;
}

function toBase64(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return window.btoa(str);
}

/** Pre-computed base64 SVG shimmer for 16:9 images */
export const SHIMMER_BLUR_16_9 = `data:image/svg+xml;base64,${toBase64(shimmer(640, 360))}`;

/** Pre-computed base64 SVG shimmer for 1:1 square images */
export const SHIMMER_BLUR_SQUARE = `data:image/svg+xml;base64,${toBase64(shimmer(400, 400))}`;

