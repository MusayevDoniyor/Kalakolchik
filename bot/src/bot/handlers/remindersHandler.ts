import { CommandContext } from "grammy";
import { BotContext } from "../index";
import { getUserReminders } from "../../services/reminderService";
import { getUserTimezone } from "../../services/userService";
import { cleanReminderTitle, getMediaIcon, formatBadgeDate } from "../../utils/reminderFormatter";
import { buildRemindersListKeyboard } from "../keyboards";

// ----------------------------------------------------------------
// /reminders (and /list) command handler
// Lists all pending one-time and recurring reminders for the user.
// ----------------------------------------------------------------

export async function remindersHandler(ctx: CommandContext<BotContext>): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  try {
    const timezone = await getUserTimezone(telegramId);
    const reminders = await getUserReminders(telegramId);

    if (reminders.length === 0) {
      await ctx.reply(
        "📭 Sizda hozircha kutilayotgan eslatmalar yo'q.\n\nYangi eslatma yaratish uchun xabar, rasm yoki ovozli xabar yuboring!"
      );
      return;
    }

    const oneTimes = reminders.filter((r) => !r.is_recurring);
    const recurring = reminders.filter((r) => r.is_recurring);

    let message = `📋 *Sizning eslatmalaringiz* (🌐 \`${timezone}\`)\n\n`;

    if (oneTimes.length > 0) {
      message += `🕒 *Bir martalik eslatmalar (${oneTimes.length}):*\n`;
      oneTimes.forEach((item, index) => {
        const title = cleanReminderTitle(item.content_text, item.media_type, 45);
        const icon = getMediaIcon(item.media_type);
        const dateBadge = formatBadgeDate(item.scheduled_at, timezone);
        message += `${index + 1}. ${icon} *${title}*\n   ⏰ ${dateBadge}\n\n`;
      });
    }

    if (recurring.length > 0) {
      message += `🔄 *Takrorlanuvchi eslatmalar (${recurring.length}):*\n`;
      recurring.forEach((item, index) => {
        const title = cleanReminderTitle(item.content_text, item.media_type, 45);
        const icon = getMediaIcon(item.media_type);
        const dateBadge = formatBadgeDate(item.scheduled_at, timezone);
        message += `${index + 1}. 🔁 ${icon} *${title}*\n   ⏰ Keyingi: ${dateBadge}\n\n`;
      });
    }

    await ctx.reply(message.trim(), {
      parse_mode: "Markdown",
      reply_markup: buildRemindersListKeyboard(),
    });
  } catch (err) {
    console.error("[remindersHandler] Error:", err);
    await ctx.reply("❌ Eslatmalarni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
  }
}
