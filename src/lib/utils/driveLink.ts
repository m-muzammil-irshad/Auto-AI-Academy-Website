const DRIVE_REGEX = /^https?:\/\/(drive|docs)\.google\.com\/.+/i;

export function isValidDriveLink(url: string): boolean {
  if (!url) return false;
  return DRIVE_REGEX.test(url.trim());
}

export const DRIVE_LINK_ERROR =
  "Enter a valid Google Drive link (e.g. file or folder link).";