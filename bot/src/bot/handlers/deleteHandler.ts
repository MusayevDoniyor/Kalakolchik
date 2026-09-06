import { CommandContext, CallbackQueryContext } from "grammy";
import { BotContext } from "../index";
import {
  getUserReminders,
  getReminderById,
  deleteReminder,
} from "../../services/reminderService";
import { getUserTimezone } from "../../services/userService";
import {
  buildReminderSelectKeyboard,
  buildConfirmDeleteKeyboard,
} from "../keyboards";
import { cleanReminderTitle, getMediaIcon, formatBadgeDate } from "../../utils/reminderFormatter";

// ----------------------------------------------------------------
// Delete Reminder Handlers
// ----------------------------------------------------------------

/**
 * /delete command handler — lists active reminders to select one for deletion.
 */
export async function deleteCommandHandler(
  ctx: CommandContext<BotContext> | CallbackQueryContext<BotContext>
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  if ("callbackQuery" in ctx && ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  try {
    const reminders = await getUserReminders(telegramId);
    if (reminders.length === 0) {
      await ctx.reply("📭 Sizda o'chirish uchun faol eslatmalar yo'q.");
      return;
    }

    const timezone = await getUserTimezone(telegramId);
    let msg = "🗑️ **O'chirmoqchi bo'lgan eslatmangizni tanlang:**\n\n";

    reminders.forEach((r, idx) => {
      const title = cleanReminderTitle(r.content_text, r.media_type, 40);
      const icon = getMediaIcon(r.media_type);
      const dateBadge = formatBadgeDate(r.scheduled_at, timezone);
      msg += `${idx + 1}. ${icon} *${title}*\n   ⏰ ${dateBadge}\n\n`;
    });

    await ctx.reply(msg.trim(), {
      parse_mode: "Markdown",
      reply_markup: buildReminderSelectKeyboard(reminders, "del_pick_"),
    });
  } catch (err) {
    console.error("[deleteCommandHandler] Error:", err);
    await ctx.reply("❌ Eslatmalarni yuklashda xatolik yuz berdi.");
  }
}

/**
 * Callback when user selects a reminder to delete (del_pick_{id}).
 */
export async function deleteSelectCallbackHandler(
  ctx: CallbackQueryContext<BotContext>
): Promise<void> {
  const data = ctx.callbackQuery.data;
  await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId || !data?.startsWith("del_pick_")) return;

  const reminderId = data.replace("del_pick_", "");

  try {
    const reminder = await getReminderById(reminderId, telegramId);
    if (!reminder) {
      await ctx.reply("⚠️ Eslatma topilmadi yoki allaqachon o'chirilgan.");
      return;
    }

    const timezone = await getUserTimezone(telegramId);
    const dateBadge = formatBadgeDate(reminder.scheduled_at, timezone);
    const title = cleanReminderTitle(reminder.content_text, reminder.media_type, 80);
    const icon = getMediaIcon(reminder.media_type);

    const msg =
      `⚠️ **Haqiqatan ham ushbu eslatmani butunlay o'chirmoqchimisiz?**\n\n` +
      `${icon} *Izoh / Content:* ${title}\n` +
      `⏰ *Vaqti:* ${dateBadge}\n\n` +
      `Ushbu amalni ortga qaytarib bo'lmaydi.`;

    await ctx.reply(msg, {
      parse_mode: "Markdown",
      reply_markup: buildConfirmDeleteKeyboard(reminderId),
    });
  } catch (err) {
    console.error("[deleteSelectCallbackHandler] Error:", err);
    await ctx.reply("❌ Eslatma ma'lumotlarini yuklashda xatolik yuz berdi.");
  }
}

/**
 * Callback when user confirms deletion (del_confirm_{id}).
 */
export async function deleteConfirmCallbackHandler(
  ctx: CallbackQueryContext<BotContext>
): Promise<void> {
  const data = ctx.callbackQuery.data;
  await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId || !data?.startsWith("del_confirm_")) return;

  const reminderId = data.replace("del_confirm_", "");

  try {
    await deleteReminder(reminderId, telegramId);
    await ctx.reply("🗑️ **Eslatma muvaffaqiyatli o'chirildi.**", {
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error("[deleteConfirmCallbackHandler] Error:", err);
    await ctx.reply("❌ Eslatmani o'chirishda xatolik yuz berdi.");
  }
}

/**
 * Callback when user cancels deletion (del_cancel).
 */
export async function deleteCancelCallbackHandler(
  ctx: CallbackQueryContext<BotContext>
): Promise<void> {
  await ctx.answerCallbackQuery();
  await ctx.reply("O'chirish bekor qilindi.");
}
