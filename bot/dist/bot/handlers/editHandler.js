"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCommandHandler = editCommandHandler;
exports.editSelectCallbackHandler = editSelectCallbackHandler;
exports.editFieldCallbackHandler = editFieldCallbackHandler;
exports.editTimeCallbackHandler = editTimeCallbackHandler;
exports.handleEditTextInput = handleEditTextInput;
const reminderService_1 = require("../../services/reminderService");
const userService_1 = require("../../services/userService");
const keyboards_1 = require("../keyboards");
const timezone_1 = require("../../utils/timezone");
const dateParser_1 = require("../../utils/dateParser");
const reminderFormatter_1 = require("../../utils/reminderFormatter");
// ----------------------------------------------------------------
// Edit Reminder Handlers
// ----------------------------------------------------------------
/**
 * /edit command handler — lists active reminders to select one for editing.
 */
async function editCommandHandler(ctx) {
    const telegramId = ctx.from?.id;
    if (!telegramId)
        return;
    if ("callbackQuery" in ctx && ctx.callbackQuery) {
        await ctx.answerCallbackQuery();
    }
    try {
        const reminders = await (0, reminderService_1.getUserReminders)(telegramId);
        if (reminders.length === 0) {
            await ctx.reply("📭 Sizda tahrirlash uchun faol eslatmalar yo'q.");
            return;
        }
        const timezone = await (0, userService_1.getUserTimezone)(telegramId);
        let msg = "✏️ **Tahrirlamoqchi bo'lgan eslatmangizni tanlang:**\n\n";
        reminders.forEach((r, idx) => {
            const title = (0, reminderFormatter_1.cleanReminderTitle)(r.content_text, r.media_type, 40);
            const icon = (0, reminderFormatter_1.getMediaIcon)(r.media_type);
            const dateBadge = (0, reminderFormatter_1.formatBadgeDate)(r.scheduled_at, timezone);
            msg += `${idx + 1}. ${icon} *${title}*\n   ⏰ ${dateBadge}\n\n`;
        });
        await ctx.reply(msg.trim(), {
            parse_mode: "Markdown",
            reply_markup: (0, keyboards_1.buildReminderSelectKeyboard)(reminders, "edit_pick_"),
        });
    }
    catch (err) {
        console.error("[editCommandHandler] Error:", err);
        await ctx.reply("❌ Eslatmalarni yuklashda xatolik yuz berdi.");
    }
}
/**
 * Callback when user selects a reminder to edit (edit_pick_{id}).
 */
async function editSelectCallbackHandler(ctx) {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId || !data?.startsWith("edit_pick_"))
        return;
    const reminderId = data.replace("edit_pick_", "");
    try {
        const reminder = await (0, reminderService_1.getReminderById)(reminderId, telegramId);
        if (!reminder) {
            await ctx.reply("⚠️ Eslatma topilmadi yoki allaqachon o'chirilgan.");
            return;
        }
        const timezone = await (0, userService_1.getUserTimezone)(telegramId);
        const dateBadge = (0, reminderFormatter_1.formatBadgeDate)(reminder.scheduled_at, timezone);
        const title = (0, reminderFormatter_1.cleanReminderTitle)(reminder.content_text, reminder.media_type, 80);
        const typeStr = reminder.is_recurring ? "🔄 Takrorlanuvchi" : "🕒 Bir martalik";
        const icon = (0, reminderFormatter_1.getMediaIcon)(reminder.media_type);
        const msg = `📋 *Eslatma ma'lumotlari:*\n\n` +
            `${icon} *Izoh / Content:* ${title}\n` +
            `🗓️ *Turi:* ${typeStr}\n` +
            `⏰ *Belgilangan vaqt:* ${dateBadge}\n\n` +
            `Qaysi qismini o'zgartirmoqchisiz?`;
        // Reset any previous editing state
        ctx.session.editing = {
            reminderId,
            currentText: reminder.content_text,
            scheduledAt: reminder.scheduled_at,
            isRecurring: reminder.is_recurring,
        };
        await ctx.reply(msg, {
            parse_mode: "Markdown",
            reply_markup: (0, keyboards_1.buildEditReminderMenuKeyboard)(reminderId),
        });
    }
    catch (err) {
        console.error("[editSelectCallbackHandler] Error:", err);
        await ctx.reply("❌ Eslatma ma'lumotlarini yuklashda xatolik yuz berdi.");
    }
}
/**
 * Callback when user chooses which field to edit (edt_note_, edt_date_, edt_time_, edt_freq_).
 */
async function editFieldCallbackHandler(ctx) {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId || !data)
        return;
    if (data === "edt_cancel") {
        ctx.session.editing = undefined;
        await ctx.reply("Tahrirlash bekor qilindi.");
        return;
    }
    const match = data.match(/^edt_(note|date|time|freq)_(.+)$/);
    if (!match)
        return;
    const [, field, reminderId] = match;
    const reminder = await (0, reminderService_1.getReminderById)(reminderId, telegramId);
    if (!reminder) {
        await ctx.reply("⚠️ Eslatma topilmadi.");
        return;
    }
    ctx.session.editing = {
        reminderId,
        field: field,
        currentText: reminder.content_text,
        scheduledAt: reminder.scheduled_at,
        isRecurring: reminder.is_recurring,
    };
    if (field === "note") {
        await ctx.reply(`📌 Hozirgi izoh: *${reminder.content_text || "(yo'q)"}*\n\nIltimos, yangi izohni yuboring:`, { parse_mode: "Markdown" });
        return;
    }
    if (field === "date") {
        await ctx.reply("📅 Yangi sanani kiriting (`KK/OO/YYYY` yoki `YYYY-MM-DD` ko'rinishida):", { parse_mode: "Markdown" });
        return;
    }
    if (field === "time") {
        await ctx.reply("⏰ Yangi eslatma vaqtini tanlang yoki yozing:", {
            reply_markup: (0, keyboards_1.buildTimeKeyboard)(),
        });
        return;
    }
    if (field === "freq") {
        await ctx.reply("🔄 Qanchalik tez-tez takrorlansin? Oraliqni kiriting (masalan: 'har kuni', 'har 2 kunda', 'har hafta'):");
        return;
    }
}
/**
 * Handles quick time button selection during editing.
 */
async function editTimeCallbackHandler(ctx) {
    const data = ctx.callbackQuery.data;
    const editing = ctx.session.editing;
    const telegramId = ctx.from?.id;
    if (!telegramId || !editing || editing.field !== "time" || !data) {
        return false;
    }
    await ctx.answerCallbackQuery();
    if (data === "time_custom") {
        await ctx.reply("Iltimos, vaqtni `20:00` yoki `8:30` ko'rinishida yozib yuboring.", {
            parse_mode: "Markdown",
        });
        return true;
    }
    const match = data.match(/^time_(\d{2}:\d{2})$/);
    if (!match)
        return false;
    const newTime = match[1];
    const userTz = await (0, userService_1.getUserTimezone)(telegramId);
    try {
        const existingReminder = await (0, reminderService_1.getReminderById)(editing.reminderId, telegramId);
        if (!existingReminder) {
            await ctx.reply("⚠️ Eslatma topilmadi.");
            ctx.session.editing = undefined;
            return true;
        }
        // Preserve the existing scheduled date, update the time
        const currentZoned = (0, timezone_1.formatZoned)(new Date(existingReminder.scheduled_at), userTz);
        // currentZoned format is DD.MM.YYYY, HH:MM
        const datePartMatch = currentZoned.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
        let dateStr = (0, timezone_1.todayInTimeZone)(userTz);
        if (datePartMatch) {
            dateStr = `${datePartMatch[3]}-${datePartMatch[2]}-${datePartMatch[1]}`;
        }
        let newScheduledUtc = (0, timezone_1.zonedWallTimeToUtc)(dateStr, newTime, userTz);
        if (!newScheduledUtc || newScheduledUtc.getTime() <= Date.now()) {
            // If time today is already past, roll over to tomorrow for one-time
            if (!existingReminder.is_recurring) {
                const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const tomorrowZoned = (0, timezone_1.formatZoned)(tomorrow, userTz);
                const tMatch = tomorrowZoned.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
                if (tMatch) {
                    dateStr = `${tMatch[3]}-${tMatch[2]}-${tMatch[1]}`;
                    newScheduledUtc = (0, timezone_1.zonedWallTimeToUtc)(dateStr, newTime, userTz);
                }
            }
        }
        if (!newScheduledUtc) {
            await ctx.reply("❌ Yangi vaqtni belgilab bo'lmadi.");
            return true;
        }
        await (0, reminderService_1.updateReminder)({
            reminderId: editing.reminderId,
            telegramId,
            scheduledAt: newScheduledUtc,
        });
        ctx.session.editing = undefined;
        const finalFormatted = (0, timezone_1.formatZoned)(newScheduledUtc, userTz);
        await ctx.reply(`✅ **Eslatma vaqti muvaffaqiyatli yangilandi!**\n\n⏰ Yangi vaqt: *${finalFormatted}*`, {
            parse_mode: "Markdown",
        });
        return true;
    }
    catch (err) {
        console.error("[editTimeCallbackHandler] Error:", err);
        await ctx.reply("❌ Vaqtni yangilashda xatolik yuz berdi.");
        return true;
    }
}
/**
 * Handles text input when user is in the middle of editing a field.
 * Returns true if text was consumed.
 */
async function handleEditTextInput(ctx) {
    const editing = ctx.session.editing;
    const text = ctx.message?.text?.trim();
    const telegramId = ctx.from?.id;
    if (!editing || !text || !telegramId)
        return false;
    const userTz = await (0, userService_1.getUserTimezone)(telegramId);
    try {
        const existingReminder = await (0, reminderService_1.getReminderById)(editing.reminderId, telegramId);
        if (!existingReminder) {
            await ctx.reply("⚠️ Tahrirlanayotgan eslatma topilmadi.");
            ctx.session.editing = undefined;
            return true;
        }
        // --- 1. EDIT NOTE ---
        if (editing.field === "note") {
            await (0, reminderService_1.updateReminder)({
                reminderId: editing.reminderId,
                telegramId,
                contentText: text,
            });
            ctx.session.editing = undefined;
            await ctx.reply(`✅ **Eslatma matni yangilandi!**\n\n📌 Yangi izoh: *${text}*`, {
                parse_mode: "Markdown",
            });
            return true;
        }
        // --- 2. EDIT DATE ---
        if (editing.field === "date") {
            const today = (0, timezone_1.todayInTimeZone)(userTz);
            const ymd = (0, dateParser_1.parseFlexibleDateYmd)(text, today);
            if (!ymd) {
                await ctx.reply("❌ Noto'g'ri sana formati. Iltimos, `KK/OO/YYYY` (masalan: `25/09/2026`) ko'rinishida yozing.", {
                    parse_mode: "Markdown",
                });
                return true;
            }
            // Extract existing clock time
            const currentZoned = (0, timezone_1.formatZoned)(new Date(existingReminder.scheduled_at), userTz);
            const timeMatch = currentZoned.match(/(\d{2}:\d{2})$/);
            const clockTime = timeMatch ? timeMatch[1] : "09:00";
            const newScheduledUtc = (0, timezone_1.zonedWallTimeToUtc)(ymd, clockTime, userTz);
            if (!newScheduledUtc || newScheduledUtc.getTime() <= Date.now()) {
                await ctx.reply("❌ Kiritilgan sana o'tib ketgan. Iltimos, kelgusi sanani kiriting.");
                return true;
            }
            await (0, reminderService_1.updateReminder)({
                reminderId: editing.reminderId,
                telegramId,
                scheduledAt: newScheduledUtc,
            });
            ctx.session.editing = undefined;
            const formatted = (0, timezone_1.formatZoned)(newScheduledUtc, userTz);
            await ctx.reply(`✅ **Eslatma sanasi yangilandi!**\n\n⏰ Yangi muddat: *${formatted}*`, {
                parse_mode: "Markdown",
            });
            return true;
        }
        // --- 3. EDIT TIME ---
        if (editing.field === "time") {
            const clockTime = (0, dateParser_1.parseClockTime)(text);
            if (!clockTime) {
                await ctx.reply("❌ Vaqt formatini tushunib bo'lmadi. Masalan: `20:00` yoki `8:30` ko'rinishida kiriting.", {
                    parse_mode: "Markdown",
                });
                return true;
            }
            const currentZoned = (0, timezone_1.formatZoned)(new Date(existingReminder.scheduled_at), userTz);
            const datePartMatch = currentZoned.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
            let dateStr = (0, timezone_1.todayInTimeZone)(userTz);
            if (datePartMatch) {
                dateStr = `${datePartMatch[3]}-${datePartMatch[2]}-${datePartMatch[1]}`;
            }
            let newScheduledUtc = (0, timezone_1.zonedWallTimeToUtc)(dateStr, clockTime, userTz);
            if (!newScheduledUtc || newScheduledUtc.getTime() <= Date.now()) {
                if (!existingReminder.is_recurring) {
                    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
                    const tomorrowZoned = (0, timezone_1.formatZoned)(tomorrow, userTz);
                    const tMatch = tomorrowZoned.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
                    if (tMatch) {
                        dateStr = `${tMatch[3]}-${tMatch[2]}-${tMatch[1]}`;
                        newScheduledUtc = (0, timezone_1.zonedWallTimeToUtc)(dateStr, clockTime, userTz);
                    }
                }
            }
            if (!newScheduledUtc) {
                await ctx.reply("❌ Yangi vaqtni belgilab bo'lmadi.");
                return true;
            }
            await (0, reminderService_1.updateReminder)({
                reminderId: editing.reminderId,
                telegramId,
                scheduledAt: newScheduledUtc,
            });
            ctx.session.editing = undefined;
            const formatted = (0, timezone_1.formatZoned)(newScheduledUtc, userTz);
            await ctx.reply(`✅ **Eslatma vaqti yangilandi!**\n\n⏰ Yangi vaqt: *${formatted}*`, {
                parse_mode: "Markdown",
            });
            return true;
        }
        // --- 4. EDIT FREQUENCY ---
        if (editing.field === "frequency") {
            const rec = (0, dateParser_1.parseRecurrence)(text);
            if (!rec) {
                await ctx.reply("❌ Takrorlanish oralig'ini tushunmadim. Masalan: 'har kuni', 'har 2 kunda' deb yozing.");
                return true;
            }
            await (0, reminderService_1.updateReminder)({
                reminderId: editing.reminderId,
                telegramId,
                isRecurring: true,
                recurringIntervalMinutes: rec.intervalMinutes,
            });
            ctx.session.editing = undefined;
            await ctx.reply(`✅ **Takrorlanish oralig'i yangilandi!**\n\n🔁 Yangi rejim: *${rec.recurrenceText}*`, {
                parse_mode: "Markdown",
            });
            return true;
        }
    }
    catch (err) {
        console.error("[handleEditTextInput] Error:", err);
        await ctx.reply("❌ Tahrirlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
        ctx.session.editing = undefined;
        return true;
    }
    return false;
}
