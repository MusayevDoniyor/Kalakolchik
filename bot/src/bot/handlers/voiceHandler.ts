import { Context, SessionFlavor } from "grammy";
import { SessionData } from "../session";
import { downloadTelegramFile } from "./mediaHandler";
import { parseVoiceNote } from "../../services/geminiService";
import { parsedToPending, logReminder } from "../../services/pendingReminder";
import { continueReminderCollection } from "./reminderFlow";
import { buildReminderTypeKeyboard } from "../keyboards";
import { DEFAULT_TIMEZONE, nowContext } from "../../utils/timezone";
import { getUserTimezone } from "../../services/userService";

type BotContext = Context & SessionFlavor<SessionData>;

function getVoiceMime(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (ext === "wav") return "audio/wav";
  if (ext === "mp3") return "audio/mp3";
  return "audio/ogg";
}

function cleanExtractedNote(note: string | null | undefined): string | null {
  if (!note) return null;
  const trimmed = note.trim();
  if (!trimmed) return null;
  // Ignore generic command filler words like "eslat", "eslatma", "buni eslat"
  if (/^(eslat|eslatma|eslatib qo'y|eslatib qoy|eslatvor|buni eslat|remind|remind me)$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export async function voiceHandler(ctx: BotContext): Promise<void> {
  const msg = ctx.message;
  if (!msg?.voice) return;

  const telegramId = ctx.from?.id;
  const userTz = telegramId ? await getUserTimezone(telegramId) : DEFAULT_TIMEZONE;

  const existing = ctx.session.pending;
  const voiceFileId = msg.voice.file_id;

  // Determine if user is following up previously sent content (photo, video, audio, text)
  const isFollowingUpContent = Boolean(
    existing && (existing.step === "awaiting_note" || existing.mediaUrl || existing.initialText)
  );

  logReminder("Voice received", {
    isFollowingUpContent,
    existingStep: existing?.step,
    existingMediaType: existing?.mediaType,
  });

  const processingMsg = await ctx.reply(
    "🎙️ Ovozli xabaringiz sun'iy intellekt yordamida tahlil qilinmoqda…"
  );

  try {
    const { buffer, filename } = await downloadTelegramFile(voiceFileId);
    const mimeType = getVoiceMime(filename);
    const clock = nowContext(userTz);

    const parsed = await parseVoiceNote(buffer, mimeType, {
      date: clock.date,
      time: clock.time,
      timezone: userTz,
    });

    logReminder("Parsed voice result:", parsed);

    const hasSchedulingInfo = Boolean(
      parsed.date || parsed.time || parsed.reminderType || parsed.intervalMinutes
    );
    const cleanNote = cleanExtractedNote(parsed.note);

    // =========================================================================
    // CASE 1: Voice message is a COMMAND given AFTER sharing reminder content
    // =========================================================================
    if (isFollowingUpContent && existing) {
      const fallbackTitle =
        existing.initialText ||
        (existing.mediaType === "image"
          ? "📷 Rasm eslatmasi"
          : existing.mediaType === "video"
            ? "🎥 Video eslatmasi"
            : existing.mediaType === "video_note"
              ? "📹 Dumaloq video"
              : existing.mediaType === "voice"
              ? "🎙️ Ovozli eslatma"
              : existing.mediaType === "document"
                ? "📄 Hujjat eslatmasi"
                : "📌 Eslatma");

      const finalNote = cleanNote || fallbackTitle;

      if (hasSchedulingInfo) {
        // Voice message contains scheduling instructions (e.g. "Ertaga soat 10 da eslat")
        const newReminder = parsedToPending(parsed);
        newReminder.timezone = newReminder.timezone || userTz;
        newReminder.note = finalNote;

        ctx.session.pending = {
          ...existing,
          step: "awaiting_voice_confirm",
          noteText: finalNote,
          reminder: newReminder,
        };

        await continueReminderCollection(ctx);
      } else {
        // Voice message is a description/title for the previously shared content
        ctx.session.pending = {
          ...existing,
          step: "awaiting_reminder_type",
          noteText: finalNote,
        };

        await ctx.reply(
          `📌 Izoh qabul qilindi: *${finalNote}*\n\nEslatmani qanday tarzda qabul qilmoqchisiz?`,
          {
            parse_mode: "Markdown",
            reply_markup: buildReminderTypeKeyboard(),
          }
        );
      }
      return;
    }

    // =========================================================================
    // CASE 2: Standalone voice message (Fresh start)
    // =========================================================================
    if (hasSchedulingInfo) {
      // User gave a complete voice command with timing (e.g. "Ertaga soat 9 da dori ichishni eslat")
      const newReminder = parsedToPending(parsed);
      newReminder.timezone = newReminder.timezone || userTz;
      const note = cleanNote || parsed.transcription || "🎙️ Ovozli eslatma";
      newReminder.note = note;

      ctx.session.pending = {
        step: "awaiting_voice_confirm",
        mediaType: "voice",
        mediaUrl: voiceFileId,
        initialText: note,
        capturedAt: new Date().toISOString(),
        noteText: note,
        reminder: newReminder,
      };

      await continueReminderCollection(ctx);
    } else {
      // User is sending an AUDIO-TYPE REMINDER (recording thoughts, voice memo, etc.)
      const memoText = cleanNote || parsed.transcription || "🎙️ Ovozli xabar";

      ctx.session.pending = {
        step: "awaiting_reminder_type",
        mediaType: "voice",
        mediaUrl: voiceFileId,
        initialText: memoText,
        capturedAt: new Date().toISOString(),
        noteText: memoText,
      };

      await ctx.reply(
        `🎙️ **Ovozli eslatmangiz qabul qilindi!**\n\n📌 **Mazmuni:** _${memoText}_\n\nEslatmani qanday tarzda qabul qilmoqchisiz?`,
        {
          parse_mode: "Markdown",
          reply_markup: buildReminderTypeKeyboard(),
        }
      );
    }
  } catch (err) {
    console.error("[voiceHandler] Error parsing voice note:", err);

    if (isFollowingUpContent && existing) {
      // Don't discard the user's previously shared content
      await ctx.reply(
        "🎙️ Ovozli buyruqni to'liq tushunib bo'lmadi. Iltimos, eslatma vaqtini matn ko'rinishida yozing (masalan: `ertaga 10:00`) yoki quyidagi tugmalardan birini tanlang:",
        {
          parse_mode: "Markdown",
          reply_markup: buildReminderTypeKeyboard(),
        }
      );
    } else {
      // Save directly as an AUDIO-TYPE REMINDER so audio is never lost
      ctx.session.pending = {
        step: "awaiting_reminder_type",
        mediaType: "voice",
        mediaUrl: voiceFileId,
        initialText: "🎙️ Ovozli eslatma",
        capturedAt: new Date().toISOString(),
        noteText: "🎙️ Ovozli eslatma",
      };

      await ctx.reply(
        "🎙️ **Ovozli eslatmangiz saqlandi!**\n\nEslatmani qachon qabul qilmoqchisiz?",
        {
          reply_markup: buildReminderTypeKeyboard(),
        }
      );
    }
  } finally {
    try {
      await ctx.api.deleteMessage(ctx.chat!.id, processingMsg.message_id);
    } catch {
      // Ignore cleanup error
    }
  }
}
