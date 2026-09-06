"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timezoneHandler = timezoneHandler;
const userService_1 = require("../../services/userService");
const keyboards_1 = require("../keyboards");
const timezone_1 = require("../../utils/timezone");
// ----------------------------------------------------------------
// /timezone command handler
// Shows current timezone and options to change it.
// ----------------------------------------------------------------
async function timezoneHandler(ctx) {
    const telegramId = ctx.from?.id;
    if (!telegramId)
        return;
    try {
        const currentTz = await (0, userService_1.getUserTimezone)(telegramId);
        const nowStr = (0, timezone_1.formatZoned)(new Date(), currentTz);
        const message = `🌍 *Vaqt mintaqasi sozlamalari*

Joriy vaqt mintaqangiz: \`${currentTz}\`
Hozirgi vaqtingiz: *${nowStr}*

O'zgartirish uchun quyidagi tugmalardan birini tanlang yoki yangi vaqt mintaqasini qo'lda yuboring (masalan: \`Asia/Tashkent\` yoki \`Europe/Moscow\`):`;
        await ctx.reply(message, {
            parse_mode: "Markdown",
            reply_markup: (0, keyboards_1.buildTimezoneKeyboard)(currentTz),
        });
    }
    catch (err) {
        console.error("[timezoneHandler] Error:", err);
        await ctx.reply("❌ Vaqt mintaqasini tekshirishda xatolik yuz berdi.");
    }
}
