import cron from "node-cron";
import { bot } from "../bot/index";
import { getDueReminders, processReminderSent } from "../services/reminderService";
import { InputFile } from "grammy";

// ----------------------------------------------------------------
// Reminder Scheduler (Cron Job)
// Runs every minute, fetches all pending reminders that are due,
// sends them to the user via Telegram, and marks them as sent.
// ----------------------------------------------------------------

export function startReminderScheduler(): void {
  console.log("[Scheduler] Reminder scheduler started — running every minute.");

  // Cron expression: every minute
  cron.schedule("* * * * *", async () => {
    console.log(`[Scheduler] Checking for due reminders at ${new Date().toISOString()}`);

    let dueReminders;
    try {
      dueReminders = await getDueReminders();
    } catch (err) {
      console.error("[Scheduler] Failed to fetch due reminders:", err);
      return;
    }

    if (dueReminders.length === 0) {
      console.log("[Scheduler] No due reminders found.");
      return;
    }

    console.log(`[Scheduler] Found ${dueReminders.length} due reminder(s). Processing...`);

    for (const reminder of dueReminders) {
      const { reminder_id, telegram_id, media_type, media_url, content_text } = reminder;

      try {
        const reminderHeader = `🔔 *Ko'rib chiqish vaqti keldi!*\n\n`;

        if (media_type === "text") {
          // Send text note
          await bot.api.sendMessage(
            telegram_id,
            reminderHeader + (content_text ?? "_(saqlangan xabar)_"),
            { parse_mode: "Markdown" }
          );
        } else if (media_type === "voice" && media_url) {
          // Send voice note (supports Telegram file_id or external URL)
          const voiceInput = media_url.startsWith("http")
            ? new InputFile(new URL(media_url))
            : media_url;
          try {
            await bot.api.sendVoice(
              telegram_id,
              voiceInput,
              {
                caption: reminderHeader + (content_text ?? ""),
                parse_mode: "Markdown",
              }
            );
          } catch {
            try {
              await bot.api.sendAudio(
                telegram_id,
                voiceInput,
                {
                  caption: reminderHeader + (content_text ?? ""),
                  parse_mode: "Markdown",
                }
              );
            } catch {
              await bot.api.sendMessage(
                telegram_id,
                reminderHeader + (content_text ?? "_(Ovozli eslatma)_"),
                { parse_mode: "Markdown" }
              );
            }
          }
        } else if (media_type === "document" && media_url) {
          // Send document / PDF / file
          const docInput = media_url.startsWith("http")
            ? new InputFile(new URL(media_url))
            : media_url;
          try {
            await bot.api.sendDocument(
              telegram_id,
              docInput,
              {
                caption: reminderHeader + (content_text ?? ""),
                parse_mode: "Markdown",
              }
            );
          } catch {
            await bot.api.sendMessage(
              telegram_id,
              reminderHeader + (content_text ?? "_(Hujjat eslatmasi)_") + (media_url.startsWith("http") ? `\n\n🔗 [Hujjatni ochish](${media_url})` : ""),
              { parse_mode: "Markdown" }
            );
          }
        } else if (media_type === "image" && media_url) {
          // Send photo (supports Telegram file_id or external URL)
          const photoInput = media_url.startsWith("http")
            ? new InputFile(new URL(media_url))
            : media_url;
          await bot.api.sendPhoto(
            telegram_id,
            photoInput,
            {
              caption: reminderHeader + (content_text ?? ""),
              parse_mode: "Markdown",
            }
          );
        } else if (media_type === "video_note" && media_url) {
          // Send circle video note (supports Telegram file_id or external URL)
          const noteInput = media_url.startsWith("http")
            ? new InputFile(new URL(media_url))
            : media_url;
          try {
            await bot.api.sendVideoNote(telegram_id, noteInput);
            await bot.api.sendMessage(
              telegram_id,
              reminderHeader + (content_text ?? ""),
              { parse_mode: "Markdown" }
            );
          } catch {
            try {
              await bot.api.sendVideo(
                telegram_id,
                noteInput,
                {
                  caption: reminderHeader + (content_text ?? ""),
                  parse_mode: "Markdown",
                }
              );
            } catch {
              await bot.api.sendMessage(
                telegram_id,
                reminderHeader + (content_text ?? "_(Dumaloq video eslatmasi)_") + (media_url.startsWith("http") ? `\n\n🔗 [Videoni ko'rish](${media_url})` : ""),
                { parse_mode: "Markdown" }
              );
            }
          }
        } else if (media_type === "video" && media_url) {
          // Send video / voice / document (supports Telegram file_id or external URL)
          const videoInput = media_url.startsWith("http")
            ? new InputFile(new URL(media_url))
            : media_url;
          try {
            await bot.api.sendVideo(
              telegram_id,
              videoInput,
              {
                caption: reminderHeader + (content_text ?? ""),
                parse_mode: "Markdown",
              }
            );
          } catch {
            try {
              await bot.api.sendVoice(
                telegram_id,
                videoInput,
                {
                  caption: reminderHeader + (content_text ?? ""),
                  parse_mode: "Markdown",
                }
              );
            } catch {
              try {
                await bot.api.sendAudio(
                  telegram_id,
                  videoInput,
                  {
                    caption: reminderHeader + (content_text ?? ""),
                    parse_mode: "Markdown",
                  }
                );
              } catch {
                await bot.api.sendDocument(
                  telegram_id,
                  videoInput,
                  {
                    caption: reminderHeader + (content_text ?? ""),
                    parse_mode: "Markdown",
                  }
                );
              }
            }
          }
        } else {
          // Fallback: send message
          await bot.api.sendMessage(
            telegram_id,
            reminderHeader + (content_text ?? "") + (media_url && media_url.startsWith("http") ? `\n\n🔗 [Faylni ochish](${media_url})` : ""),
            { parse_mode: "Markdown" }
          );
        }

        // Process the reminder (mark sent or reschedule if recurring)
        await processReminderSent(
          reminder_id, 
          reminder.is_recurring, 
          reminder.recurring_interval_minutes,
          reminder.end_date
        );
        console.log(`[Scheduler] Processed reminder ${reminder_id} for user ${telegram_id}.`);
      } catch (err) {
        console.error(`[Scheduler] Failed to process reminder ${reminder_id}:`, err);
        // Don't mark as sent — it will be retried next minute
      }
    }
  });
}
