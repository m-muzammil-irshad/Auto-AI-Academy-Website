const DRIVE_REGEX =
  /^https?:\/\/(drive|docs)\.google\.com\/(file\/d\/[^/]+|drive\/folders\/[^/?]+|open\?id=[^&]+|document\/d\/[^/]+).*/i;

export function isValidDriveLink(url: string): boolean {
  if (!url) return false;
  return DRIVE_REGEX.test(url.trim());
}

export const DRIVE_LINK_ERROR =
  "Enter a valid Google Drive link (e.g. https://drive.google.com/file/d/...).";