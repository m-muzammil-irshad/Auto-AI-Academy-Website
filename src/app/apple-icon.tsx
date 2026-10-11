import { ImageResponse } from "next/og";
import { brandIcon } from "@/lib/brandIcon";

// Home-screen icon for iPhone and iPad. iOS rounds the corners itself,
// so this one is a full square.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(brandIcon(size.width, { square: true }), size);
}
