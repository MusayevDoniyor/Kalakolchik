import { formatZoned } from "./timezone";

/**
 * Cleans content text by removing internal headers, newlines, and markdown syntax.
 * Returns a neat single-line title suitable for lists and buttons.
 */
export function cleanReminderTitle(
  contentText: string | null | undefined,
  mediaType?: string,
  maxLength: number = 45
): string {
  if (!contentText) {
    if (mediaType === "image") return "📷 Rasm eslatmasi";
    if (mediaType === "video") return "🎥 Video eslatmasi";
    if (mediaType === "video_note") return "📹 Dumaloq video";
    if (mediaType === "voice") return "🎙️ Ovozli eslatma";
    if (mediaType === "document") return "📄 Hujjat / Fayl";
    return "📌 Eslatma";
  }

  // Strip internal labels and markdown formatting
  let clean = contentText
    .replace(/🎯\s*\*\*Harakat\s*\/\s*Vazifa:\*\*/gi, "—")
    .replace(/📌\s*\*\*Note:\*\*/gi, "—")
    .replace(/[\*\_`#]/g, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove leading punctuation like "- ", "— "
  clean = clean.replace(/^[\-\—\:\s\.]+/, "");

  if (!clean) {
    if (mediaType === "image") return "📷 Rasm eslatmasi";
    if (mediaType === "video") return "🎥 Video eslatmasi";
    if (mediaType === "video_note") return "📹 Dumaloq video";
    if (mediaType === "voice") return "🎙️ Ovozli eslatma";
    if (mediaType === "document") return "📄 Hujjat / Fayl";
    return "📌 Eslatma";
  }

  if (clean.length > maxLength) {
    return clean.slice(0, maxLength - 3).trim() + "...";
  }

  return clean;
}

/**
 * Returns an appropriate media icon for a given mediaType.
 */
export function getMediaIcon(mediaType?: string): string {
  if (mediaType === "image") return "📷";
  if (mediaType === "video") return "🎥";
  if (mediaType === "video_note") return "📹";
  if (mediaType === "voice") return "🎙️";
  if (mediaType === "document") return "📄";
  return "📌";
}

/**
 * Formats a date string into a clean monospaced Telegram badge string.
 * Example: `06.09.2026, 15:00`
 */
export function formatBadgeDate(isoString: string, timezone: string): string {
  const formatted = formatZoned(new Date(isoString), timezone);
  return `\`${formatted}\``;
}
