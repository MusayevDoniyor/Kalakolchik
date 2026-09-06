import { CommandContext, CallbackQueryContext } from "grammy";
import { BotContext } from "../index";
import { getActiveCyclesForUser } from "../../services/reminderService";
import { buildStopCycleKeyboard } from "../keyboards";

import { getUserTimezone } from "../../services/userService";
import { cleanReminderTitle, getMediaIcon, formatBadgeDate } from "../../utils/reminderFormatter";

// ----------------------------------------------------------------
// /stop command handler
// Shows active recurring cycles and allows user to stop them.
// ----------------------------------------------------------------

export async function stopHandler(
  ctx: CommandContext<BotContext> | CallbackQueryContext<BotContext>
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  if ("callbackQuery" in ctx && ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
  }

  try {
    const timezone = await getUserTimezone(telegramId);
    const activeCycles = await getActiveCyclesForUser(telegramId);

    if (activeCycles.length === 0) {
      await ctx.reply("Sizda to'xtatish uchun faol takrorlanuvchi eslatmalar yo'q.");
      return;
    }

    // Display active cycles with stop buttons
    let message = "🔄 **Faol takrorlanuvchi eslatmalaringiz:**\n\n";
    
    activeCycles.forEach((cycle, index) => {
      const title = cleanReminderTitle(cycle.content_text, cycle.media_type, 45);
      const icon = getMediaIcon(cycle.media_type);
      const dateBadge = formatBadgeDate(cycle.scheduled_at, timezone);
      message += `${index + 1}. 🔁 ${icon} *${title}*\n   ⏰ Keyingi: ${dateBadge}\n\n`;
    });

    message += "To'xtatmoqchi bo'lgan eslatmangizni tanlang:";

    await ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: buildStopCycleKeyboard(activeCycles),
    });
  } catch (err) {
    console.error("[stopHandler] Error:", err);
    await ctx.reply("❌ Faol eslatmalarni olishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
  }
}