"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelHandler = cancelHandler;
// ----------------------------------------------------------------
// /cancel command handler
// Cancels any ongoing pending reminder creation flow.
// ----------------------------------------------------------------
async function cancelHandler(ctx) {
    const hadActive = Boolean(ctx.session.pending || ctx.session.editing);
    ctx.session.pending = undefined;
    ctx.session.editing = undefined;
    if (hadActive) {
        await ctx.reply("❌ Joriy amal bekor qilindi.\n\nYangi eslatma yaratish uchun xabar, rasm yoki audio yuboring, yoki /new buyrug'ini bosing.");
    }
    else {
        await ctx.reply("Bekor qiladigan faol amal yo'q.\n\nYangi eslatma yaratish uchun xabar yoki fayl yuborishingiz mumkin.");
    }
}
