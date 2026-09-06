"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReminderTypeKeyboard = buildReminderTypeKeyboard;
exports.buildOneTimeKeyboard = buildOneTimeKeyboard;
exports.buildStopCycleKeyboard = buildStopCycleKeyboard;
exports.buildVoiceConfirmKeyboard = buildVoiceConfirmKeyboard;
exports.buildTimeKeyboard = buildTimeKeyboard;
exports.buildEditChoiceKeyboard = buildEditChoiceKeyboard;
exports.buildTimezoneKeyboard = buildTimezoneKeyboard;
exports.buildReminderSelectKeyboard = buildReminderSelectKeyboard;
exports.buildEditReminderMenuKeyboard = buildEditReminderMenuKeyboard;
exports.buildConfirmDeleteKeyboard = buildConfirmDeleteKeyboard;
exports.buildRemindersListKeyboard = buildRemindersListKeyboard;
const grammy_1 = require("grammy");
function buildReminderTypeKeyboard() {
    return new grammy_1.InlineKeyboard()
        .text("🕒 Bir martalik", "type_onetime")
        .text("🔄 Davriy (takrorlanuvchi)", "type_cycle");
}
function buildOneTimeKeyboard() {
    return new grammy_1.InlineKeyboard()
        .text("1 kundan keyin", "remind_1d")
        .text("3 kundan keyin", "remind_3d")
        .text("5 kundan keyin", "remind_5d")
        .row()
        .text("✏️ Boshqa sana", "remind_custom");
}
const reminderFormatter_1 = require("../utils/reminderFormatter");
function buildStopCycleKeyboard(cycles) {
    const keyboard = new grammy_1.InlineKeyboard();
    cycles.forEach((cycle, index) => {
        const title = (0, reminderFormatter_1.cleanReminderTitle)(cycle.content_text, cycle.media_type, 20);
        const buttonLabel = `🛑 ${index + 1}. ${title}`;
        const callbackData = `stop_${cycle.reminder_id}`;
        keyboard.text(buttonLabel, callbackData);
        if ((index + 1) % 2 === 0 && index < cycles.length - 1) {
            keyboard.row();
        }
    });
    return keyboard;
}
function buildVoiceConfirmKeyboard() {
    return new grammy_1.InlineKeyboard()
        .text("✅ Tasdiqlash", "voice_confirm")
        .text("✏️ O'zgartirish", "voice_edit")
        .text("❌ Bekor qilish", "voice_cancel");
}
function buildTimeKeyboard() {
    return new grammy_1.InlineKeyboard()
        .text("08:00", "time_08:00")
        .text("13:00", "time_13:00")
        .text("18:00", "time_18:00")
        .row()
        .text("20:00", "time_20:00")
        .text("21:00", "time_21:00")
        .text("Boshqa vaqt", "time_custom");
}
function buildEditChoiceKeyboard() {
    return new grammy_1.InlineKeyboard()
        .text("🎯 Harakat / Izoh", "edit_field_action")
        .text("📅 Sana", "edit_field_date")
        .row()
        .text("🕐 Vaqt", "edit_field_time")
        .text("🔁 Takrorlanish", "edit_field_frequency")
        .row()
        .text("⏳ Tugash sanasi", "edit_field_end")
        .text("⬅️ Orqaga", "edit_field_back");
}
const timezone_1 = require("../utils/timezone");
function buildTimezoneKeyboard(currentTimezone) {
    const keyboard = new grammy_1.InlineKeyboard();
    timezone_1.TIMEZONE_PRESETS.forEach((preset, index) => {
        const isCurrent = currentTimezone === preset.value;
        const label = isCurrent ? `✅ ${preset.label}` : preset.label;
        const callbackData = `tz_${preset.value}`;
        keyboard.text(label, callbackData);
        // 2 buttons per row
        if ((index + 1) % 2 === 0 && index < timezone_1.TIMEZONE_PRESETS.length - 1) {
            keyboard.row();
        }
    });
    return keyboard;
}
/**
 * Builds a keyboard listing active reminders for editing or deletion.
 */
function buildReminderSelectKeyboard(reminders, prefix) {
    const keyboard = new grammy_1.InlineKeyboard();
    reminders.forEach((r, index) => {
        const icon = prefix === "edit_pick_" ? "✏️" : "🗑️";
        const title = (0, reminderFormatter_1.cleanReminderTitle)(r.content_text, r.media_type, 20);
        const label = `${icon} ${index + 1}. ${title}`;
        const callbackData = `${prefix}${r.reminder_id}`;
        keyboard.text(label, callbackData);
        if ((index + 1) % 2 === 0 && index < reminders.length - 1) {
            keyboard.row();
        }
    });
    return keyboard;
}
/**
 * Menu keyboard for choosing which field of a reminder to edit.
 */
function buildEditReminderMenuKeyboard(reminderId) {
    return new grammy_1.InlineKeyboard()
        .text("🎯 Izohni tahrirlash", `edt_note_${reminderId}`)
        .text("📅 Sanani o'zgartirish", `edt_date_${reminderId}`)
        .row()
        .text("⏰ Vaqtni o'zgartirish", `edt_time_${reminderId}`)
        .text("🔁 Takrorlanishni o'zgartirish", `edt_freq_${reminderId}`)
        .row()
        .text("⬅️ Bekor qilish", "edt_cancel");
}
/**
 * Confirmation keyboard for deleting a reminder.
 */
function buildConfirmDeleteKeyboard(reminderId) {
    return new grammy_1.InlineKeyboard()
        .text("🗑️ Ha, o'chirilsin", `del_confirm_${reminderId}`)
        .text("❌ Bekor qilish", "del_cancel");
}
/**
 * Action keyboard shown under /reminders list for quick access.
 */
function buildRemindersListKeyboard() {
    return new grammy_1.InlineKeyboard()
        .text("✏️ Tahrirlash", "cmd_edit")
        .text("🗑️ O'chirish", "cmd_delete")
        .text("🛑 To'xtatish", "cmd_stop");
}
