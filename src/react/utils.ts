/**
 * Tiny, dependency-free helpers shared by the React UI.
 * Kept here so we can grow utilities without re-exporting from
 * every component file.
 */

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

const rtf =
  typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat !== "undefined"
    ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
    : null;

/** Format an ISO date as a relative time, falling back to absolute. */
export function relativeTime(value: string, now: number = Date.now()): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  const diff = (date.getTime() - now) / 1000;
  if (Math.abs(diff) < 5) return "just now";
  if (!rtf) return date.toLocaleString();
  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= seconds || unit === "second") {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return date.toLocaleString();
}

/** Format an ISO date as a localized date+time. */
export function formatDateTime(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** Format an ISO date as a localized date only. */
export function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

/** Pick a deterministic hue (0-360) for a string. Used for avatar backgrounds. */
export function hueFor(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

/** Compute a 2-letter initials block from a display name. */
export function initialsOf(value: string): string {
  const parts = value.trim().split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const out = (first + second).toUpperCase();
  return out || "U";
}

/** Pick a device icon from the device string. */
export function deviceIconName(device: string | null | undefined) {
  const value = (device ?? "").toLowerCase();
  if (/(phone|iphone|android|mobile)/.test(value)) return "phone" as const;
  if (/ipad|tablet/.test(value)) return "tablet" as const;
  if (/macbook|laptop|chromebook/.test(value)) return "laptop" as const;
  if (/windows|linux|desktop|pc|monitor/.test(value)) return "monitor" as const;
  return "device" as const;
}

/** Score a password's strength 0..4. */
export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hint: string;
} {
  if (!password) return { score: 0, label: "Empty", hint: "Choose a password" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  const finalScore = Math.max(1, Math.min(4, score)) as 1 | 2 | 3 | 4;
  const labels: Record<number, { label: string; hint: string }> = {
    1: { label: "Too weak", hint: "Add length and character variety" },
    2: { label: "Could be stronger", hint: "Try a longer passphrase" },
    3: { label: "Strong", hint: "Nice — looks good" },
    4: { label: "Very strong", hint: "Great choice" },
  };
  return { score: finalScore, ...labels[finalScore]! };
}

/** Lightweight email validation (the SDK does the strict server-side check). */
export function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
