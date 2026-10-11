import { ImageResponse } from "next/og";
import { brandIcon } from "@/lib/brandIcon";

// Browser-tab icon. 96px is a multiple of 48, which Google asks for in search results.
// Edge runtime: the Node version fails on Windows when the project path contains spaces.
export const runtime = "edge";
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(brandIcon(size.width), size);
}
