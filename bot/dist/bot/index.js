"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
exports.registerBotCommands = registerBotCommands;
const grammy_1 = require("grammy");
const env_1 = require("../config/env");
const startHandler_1 = require("./handlers/startHandler");
const stopHandler_1 = require("./handlers/stopHandler");
const helpHandler_1 = require("./handlers/helpHandler");
const cancelHandler_1 = require("./handlers/cancelHandler");
const remindersHandler_1 = require("./handlers/remindersHandler");
const timezoneHandler_1 = require("./handlers/timezoneHandler");
const mediaHandler_1 = require("./handlers/mediaHandler");
const noteHandler_1 = require("./handlers/noteHandler");
const callbackHandler_1 = require("./handlers/callbackHandler");
const voiceHandler_1 = require("./handlers/voiceHandler");
const editHandler_1 = require("./handlers/editHandler");
const deleteHandler_1 = require("./handlers/deleteHandler");
exports.bot = new grammy_1.Bot(env_1.env.TELEGRAM_BOT_TOKEN);
/**
 * Registers default bot commands in the Telegram menu button
 */
async function registerBotCommands(botInstance) {
    try {
        await botInstance.api.setMyCommands([
            { command: "start", description: "Botni ishga tushirish / Xush kelibsiz" },
            { command: "new", description: "Yangi eslatma yaratish" },
            { command: "reminders", description: "Faol eslatmalar ro'yxati" },
            { command: "edit", description: "Eslatmani tahrirlash" },
            { command: "delete", description: "Eslatmani o'chirish" },
            { command: "stop", description: "Takrorlanuvchi eslatmalarni to'xtatish" },
            { command: "timezone", description: "Vaqt mintaqasini sozlash" },
            { command: "help", description: "Qo'llanma va yordam" },
            { command: "cancel", description: "Joriy amalni bekor qilish" },
        ]);
        console.log("✅ Bot default commands registered successfully.");
    }
    catch (err) {
        console.error("⚠️ Failed to set bot commands:", err);
    }
}
// --- Session Middleware ---
// Stores per-chat conversation state in memory.
exports.bot.use((0, grammy_1.session)({
    initial: () => ({ pending: undefined, editing: undefined }),
}));
// --- Command Handlers ---
exports.bot.command("start", startHandler_1.startHandler);
exports.bot.command("new", startHandler_1.newReminderHandler);
exports.bot.command(["reminders", "list"], remindersHandler_1.remindersHandler);
exports.bot.command("edit", editHandler_1.editCommandHandler);
exports.bot.command(["delete", "del", "remove"], deleteHandler_1.deleteCommandHandler);
exports.bot.command("stop", stopHandler_1.stopHandler);
exports.bot.command("timezone", timezoneHandler_1.timezoneHandler);
exports.bot.command(["about", "help"], helpHandler_1.helpHandler);
exports.bot.command("cancel", cancelHandler_1.cancelHandler);
// --- Quick Action Callbacks from /reminders list ---
exports.bot.callbackQuery("cmd_edit", editHandler_1.editCommandHandler);
exports.bot.callbackQuery("cmd_delete", deleteHandler_1.deleteCommandHandler);
exports.bot.callbackQuery("cmd_stop", stopHandler_1.stopHandler);
// --- Timezone Selection Callback Handler ---
exports.bot.callbackQuery(/^tz_/, callbackHandler_1.timezoneCallbackHandler);
// --- Stop Cycle Callback Handler ---
exports.bot.callbackQuery(/^stop_/, callbackHandler_1.stopCycleCallbackHandler);
// --- Edit Reminder Callback Handlers ---
exports.bot.callbackQuery(/^edit_pick_/, editHandler_1.editSelectCallbackHandler);
exports.bot.callbackQuery(/^edt_/, editHandler_1.editFieldCallbackHandler);
exports.bot.callbackQuery(/^time_/, async (ctx, next) => {
    if (ctx.session.editing?.field === "time") {
        const handled = await (0, editHandler_1.editTimeCallbackHandler)(ctx);
        if (handled)
            return;
    }
    await next();
});
// --- Delete Reminder Callback Handlers ---
exports.bot.callbackQuery(/^del_pick_/, deleteHandler_1.deleteSelectCallbackHandler);
exports.bot.callbackQuery(/^del_confirm_/, deleteHandler_1.deleteConfirmCallbackHandler);
exports.bot.callbackQuery("del_cancel", deleteHandler_1.deleteCancelCallbackHandler);
// --- Inline Keyboard Callback Handlers ---
// All callback data values emitted by reminder flow keyboards must be listed here.
// grammY silently drops callbacks not matching any registered filter.
exports.bot.callbackQuery([
    // Reminder type selection (old flow + voice flow)
    "type_onetime", "type_cycle",
    // One-time quick date selection (old flow)
    "remind_1d", "remind_3d", "remind_5d", "remind_custom",
    // Preview confirmation (voice flow)
    "voice_confirm", "voice_edit", "voice_cancel",
    // Time picker keyboard
    "time_08:00", "time_13:00", "time_18:00", "time_20:00", "time_21:00", "time_custom",
    // Edit field selection keyboard
    "edit_field_action", "edit_field_date", "edit_field_time",
    "edit_field_frequency", "edit_field_end", "edit_field_back",
], callbackHandler_1.scheduleCallbackHandler);
// --- Voice Note Handler (Gemini Flash) ---
// Must be registered BEFORE the generic text/media handler
exports.bot.on("message:voice", voiceHandler_1.voiceHandler);
// --- Message Handler (Text / Photo / Video / Video Note / Document / Audio) ---
exports.bot.on(["message:text", "message:photo", "message:video", "message:video_note", "message:document", "message:audio"], async (ctx) => {
    const text = ctx.message?.text;
    // 1. Skip commands
    if (text?.startsWith("/"))
        return;
    // 2. Handle text inputs for Edit Reminder Flow
    const editHandled = await (0, editHandler_1.handleEditTextInput)(ctx);
    if (editHandled)
        return;
    // 3. Handle text inputs for Custom Dates and Cycle Intervals (Step 4)
    const textHandled = await (0, callbackHandler_1.textInputHandler)(ctx);
    if (textHandled)
        return;
    // 4. If user is in "awaiting_note" step, receive their note (Step 2)
    const noteHandled = await (0, noteHandler_1.receiveNoteHandler)(ctx);
    if (noteHandled)
        return;
    // 5. Otherwise treat this as new media/content (Step 1)
    await (0, mediaHandler_1.receiveMediaHandler)(ctx);
});
// --- Error Handler ---
exports.bot.catch((err) => {
    console.error("[Bot Error]", err.message, "\n", err.error);
});
