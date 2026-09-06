"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommandHandler = deleteCommandHandler;
exports.deleteSelectCallbackHandler = deleteSelectCallbackHandler;
exports.deleteConfirmCallbackHandler = deleteConfirmCallbackHandler;
exports.deleteCancelCallbackHandler = deleteCancelCallbackHandler;
const reminderService_1 = require("../../services/reminderService");
const userService_1 = require("../../services/userService");
const keyboards_1 = require("../keyboards");
const reminderFormatter_1 = require("../../utils/reminderFormatter");
// ----------------------------------------------------------------
// Delete Reminder Handlers
// ----------------------------------------------------------------
/**
 * /delete command handler — lists active reminders to select one for deletion.
 */
async function deleteCommandHandler(ctx) {
    const telegramId = ctx.from?.id;
    if (!telegramId)
        return;
    if ("callbackQuery" in ctx && ctx.callbackQuery) {
        await ctx.answerCallbackQuery();
    }
    try {
        const reminders = await (0, reminderService_1.getUserReminders)(telegramId);
        if (reminders.length === 0) {
            await ctx.reply("📭 Sizda o'chirish uchun faol eslatmalar yo'q.");
            return;
        }
        const timezone = await (0, userService_1.getUserTimezone)(telegramId);
        let msg = "🗑️ **O'chirmoqchi bo'lgan eslatmangizni tanlang:**\n\n";
        reminders.forEach((r, idx) => {
            const title = (0, reminderFormatter_1.cleanReminderTitle)(r.content_text, r.media_type, 40);
            const icon = (0, reminderFormatter_1.getMediaIcon)(r.media_type);
            const dateBadge = (0, reminderFormatter_1.formatBadgeDate)(r.scheduled_at, timezone);
            msg += `${idx + 1}. ${icon} *${title}*\n   ⏰ ${dateBadge}\n\n`;
        });
        await ctx.reply(msg.trim(), {
            parse_mode: "Markdown",
            reply_markup: (0, keyboards_1.buildReminderSelectKeyboard)(reminders, "del_pick_"),
        });
    }
    catch (err) {
        console.error("[deleteCommandHandler] Error:", err);
        await ctx.reply("❌ Eslatmalarni yuklashda xatolik yuz berdi.");
    }
}
/**
 * Callback when user selects a reminder to delete (del_pick_{id}).
 */
async function deleteSelectCallbackHandler(ctx) {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId || !data?.startsWith("del_pick_"))
        return;
    const reminderId = data.replace("del_pick_", "");
    try {
        const reminder = await (0, reminderService_1.getReminderById)(reminderId, telegramId);
        if (!reminder) {
            await ctx.reply("⚠️ Eslatma topilmadi yoki allaqachon o'chirilgan.");
            return;
        }
        const timezone = await (0, userService_1.getUserTimezone)(telegramId);
        const dateBadge = (0, reminderFormatter_1.formatBadgeDate)(reminder.scheduled_at, timezone);
        const title = (0, reminderFormatter_1.cleanReminderTitle)(reminder.content_text, reminder.media_type, 80);
        const icon = (0, reminderFormatter_1.getMediaIcon)(reminder.media_type);
        const msg = `⚠️ **Haqiqatan ham ushbu eslatmani butunlay o'chirmoqchimisiz?**\n\n` +
            `${icon} *Izoh / Content:* ${title}\n` +
            `⏰ *Vaqti:* ${dateBadge}\n\n` +
            `Ushbu amalni ortga qaytarib bo'lmaydi.`;
        await ctx.reply(msg, {
            parse_mode: "Markdown",
            reply_markup: (0, keyboards_1.buildConfirmDeleteKeyboard)(reminderId),
        });
    }
    catch (err) {
        console.error("[deleteSelectCallbackHandler] Error:", err);
        await ctx.reply("❌ Eslatma ma'lumotlarini yuklashda xatolik yuz berdi.");
    }
}
/**
 * Callback when user confirms deletion (del_confirm_{id}).
 */
async function deleteConfirmCallbackHandler(ctx) {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId || !data?.startsWith("del_confirm_"))
        return;
    const reminderId = data.replace("del_confirm_", "");
    try {
        await (0, reminderService_1.deleteReminder)(reminderId, telegramId);
        await ctx.reply("🗑️ **Eslatma muvaffaqiyatli o'chirildi.**", {
            parse_mode: "Markdown",
        });
    }
    catch (err) {
        console.error("[deleteConfirmCallbackHandler] Error:", err);
        await ctx.reply("❌ Eslatmani o'chirishda xatolik yuz berdi.");
    }
}
/**
 * Callback when user cancels deletion (del_cancel).
 */
async function deleteCancelCallbackHandler(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply("O'chirish bekor qilindi.");
}
