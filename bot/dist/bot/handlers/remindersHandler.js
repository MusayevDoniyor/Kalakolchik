"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remindersHandler = remindersHandler;
const reminderService_1 = require("../../services/reminderService");
const userService_1 = require("../../services/userService");
const reminderFormatter_1 = require("../../utils/reminderFormatter");
const keyboards_1 = require("../keyboards");
// ----------------------------------------------------------------
// /reminders (and /list) command handler
// Lists all pending one-time and recurring reminders for the user.
// ----------------------------------------------------------------
async function remindersHandler(ctx) {
    const telegramId = ctx.from?.id;
    if (!telegramId)
        return;
    try {
        const timezone = await (0, userService_1.getUserTimezone)(telegramId);
        const reminders = await (0, reminderService_1.getUserReminders)(telegramId);
        if (reminders.length === 0) {
            await ctx.reply("📭 Sizda hozircha kutilayotgan eslatmalar yo'q.\n\nYangi eslatma yaratish uchun xabar, rasm yoki ovozli xabar yuboring!");
            return;
        }
        const oneTimes = reminders.filter((r) => !r.is_recurring);
        const recurring = reminders.filter((r) => r.is_recurring);
        let message = `📋 *Sizning eslatmalaringiz* (🌐 \`${timezone}\`)\n\n`;
        if (oneTimes.length > 0) {
            message += `🕒 *Bir martalik eslatmalar (${oneTimes.length}):*\n`;
            oneTimes.forEach((item, index) => {
                const title = (0, reminderFormatter_1.cleanReminderTitle)(item.content_text, item.media_type, 45);
                const icon = (0, reminderFormatter_1.getMediaIcon)(item.media_type);
                const dateBadge = (0, reminderFormatter_1.formatBadgeDate)(item.scheduled_at, timezone);
                message += `${index + 1}. ${icon} *${title}*\n   ⏰ ${dateBadge}\n\n`;
            });
        }
        if (recurring.length > 0) {
            message += `🔄 *Takrorlanuvchi eslatmalar (${recurring.length}):*\n`;
            recurring.forEach((item, index) => {
                const title = (0, reminderFormatter_1.cleanReminderTitle)(item.content_text, item.media_type, 45);
                const icon = (0, reminderFormatter_1.getMediaIcon)(item.media_type);
                const dateBadge = (0, reminderFormatter_1.formatBadgeDate)(item.scheduled_at, timezone);
                message += `${index + 1}. 🔁 ${icon} *${title}*\n   ⏰ Keyingi: ${dateBadge}\n\n`;
            });
        }
        await ctx.reply(message.trim(), {
            parse_mode: "Markdown",
            reply_markup: (0, keyboards_1.buildRemindersListKeyboard)(),
        });
    }
    catch (err) {
        console.error("[remindersHandler] Error:", err);
        await ctx.reply("❌ Eslatmalarni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    }
}
