"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopHandler = stopHandler;
const reminderService_1 = require("../../services/reminderService");
const keyboards_1 = require("../keyboards");
const userService_1 = require("../../services/userService");
const reminderFormatter_1 = require("../../utils/reminderFormatter");
// ----------------------------------------------------------------
// /stop command handler
// Shows active recurring cycles and allows user to stop them.
// ----------------------------------------------------------------
async function stopHandler(ctx) {
    const telegramId = ctx.from?.id;
    if (!telegramId)
        return;
    if ("callbackQuery" in ctx && ctx.callbackQuery) {
        await ctx.answerCallbackQuery();
    }
    try {
        const timezone = await (0, userService_1.getUserTimezone)(telegramId);
        const activeCycles = await (0, reminderService_1.getActiveCyclesForUser)(telegramId);
        if (activeCycles.length === 0) {
            await ctx.reply("Sizda to'xtatish uchun faol takrorlanuvchi eslatmalar yo'q.");
            return;
        }
        // Display active cycles with stop buttons
        let message = "🔄 **Faol takrorlanuvchi eslatmalaringiz:**\n\n";
        activeCycles.forEach((cycle, index) => {
            const title = (0, reminderFormatter_1.cleanReminderTitle)(cycle.content_text, cycle.media_type, 45);
            const icon = (0, reminderFormatter_1.getMediaIcon)(cycle.media_type);
            const dateBadge = (0, reminderFormatter_1.formatBadgeDate)(cycle.scheduled_at, timezone);
            message += `${index + 1}. 🔁 ${icon} *${title}*\n   ⏰ Keyingi: ${dateBadge}\n\n`;
        });
        message += "To'xtatmoqchi bo'lgan eslatmangizni tanlang:";
        await ctx.reply(message, {
            parse_mode: "Markdown",
            reply_markup: (0, keyboards_1.buildStopCycleKeyboard)(activeCycles),
        });
    }
    catch (err) {
        console.error("[stopHandler] Error:", err);
        await ctx.reply("❌ Faol eslatmalarni olishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    }
}
