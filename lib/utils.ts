import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges conditional classes AND resolves Tailwind conflicts (last wins).
// Without twMerge, `cn('p-2', 'p-4')` keeps both; with it, p-4 wins. Essential for variant components.
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];
const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// "3 hours ago" / "in 2 days" style formatting for timestamps like createdAt/updatedAt.
export function timeAgo(iso: string): string {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return relativeFormatter.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return relativeFormatter.format(Math.round(seconds), "second");
}

// "94.5 KB" / "2.3 MB" style formatting for a raw byte count (Resume.fileSize).
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
