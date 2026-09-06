"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanReminderTitle = cleanReminderTitle;
exports.getMediaIcon = getMediaIcon;
exports.formatBadgeDate = formatBadgeDate;
const timezone_1 = require("./timezone");
/**
 * Cleans content text by removing internal headers, newlines, and markdown syntax.
 * Returns a neat single-line title suitable for lists and buttons.
 */
function cleanReminderTitle(contentText, mediaType, maxLength = 45) {
    if (!contentText) {
        if (mediaType === "image")
            return "📷 Rasm eslatmasi";
        if (mediaType === "video")
            return "🎥 Video eslatmasi";
        if (mediaType === "video_note")
            return "📹 Dumaloq video";
        if (mediaType === "voice")
            return "🎙️ Ovozli eslatma";
        if (mediaType === "document")
            return "📄 Hujjat / Fayl";
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
        if (mediaType === "image")
            return "📷 Rasm eslatmasi";
        if (mediaType === "video")
            return "🎥 Video eslatmasi";
        if (mediaType === "video_note")
            return "📹 Dumaloq video";
        if (mediaType === "voice")
            return "🎙️ Ovozli eslatma";
        if (mediaType === "document")
            return "📄 Hujjat / Fayl";
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
function getMediaIcon(mediaType) {
    if (mediaType === "image")
        return "📷";
    if (mediaType === "video")
        return "🎥";
    if (mediaType === "video_note")
        return "📹";
    if (mediaType === "voice")
        return "🎙️";
    if (mediaType === "document")
        return "📄";
    return "📌";
}
/**
 * Formats a date string into a clean monospaced Telegram badge string.
 * Example: `06.09.2026, 15:00`
 */
function formatBadgeDate(isoString, timezone) {
    const formatted = (0, timezone_1.formatZoned)(new Date(isoString), timezone);
    return `\`${formatted}\``;
}
