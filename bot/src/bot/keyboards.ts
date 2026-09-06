import { InlineKeyboard } from "grammy";

export function buildReminderTypeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🕒 Bir martalik", "type_onetime")
    .text("🔄 Davriy (takrorlanuvchi)", "type_cycle");
}

export function buildOneTimeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("1 kundan keyin", "remind_1d")
    .text("3 kundan keyin", "remind_3d")
    .text("5 kundan keyin", "remind_5d")
    .row()
    .text("✏️ Boshqa sana", "remind_custom");
}

import { cleanReminderTitle } from "../utils/reminderFormatter";

export function buildStopCycleKeyboard(cycles: any[]): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  cycles.forEach((cycle, index) => {
    const title = cleanReminderTitle(cycle.content_text, cycle.media_type, 20);
    const buttonLabel = `🛑 ${index + 1}. ${title}`;
    const callbackData = `stop_${cycle.reminder_id}`;

    keyboard.text(buttonLabel, callbackData);

    if ((index + 1) % 2 === 0 && index < cycles.length - 1) {
      keyboard.row();
    }
  });

  return keyboard;
}

export function buildVoiceConfirmKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Tasdiqlash", "voice_confirm")
    .text("✏️ O'zgartirish", "voice_edit")
    .text("❌ Bekor qilish", "voice_cancel");
}

export function buildTimeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("08:00", "time_08:00")
    .text("13:00", "time_13:00")
    .text("18:00", "time_18:00")
    .row()
    .text("20:00", "time_20:00")
    .text("21:00", "time_21:00")
    .text("Boshqa vaqt", "time_custom");
}

export function buildEditChoiceKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🎯 Harakat / Izoh", "edit_field_action")
    .text("📅 Sana", "edit_field_date")
    .row()
    .text("🕐 Vaqt", "edit_field_time")
    .text("🔁 Takrorlanish", "edit_field_frequency")
    .row()
    .text("⏳ Tugash sanasi", "edit_field_end")
    .text("⬅️ Orqaga", "edit_field_back");
}

import { TIMEZONE_PRESETS } from "../utils/timezone";

export function buildTimezoneKeyboard(currentTimezone?: string): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  TIMEZONE_PRESETS.forEach((preset, index) => {
    const isCurrent = currentTimezone === preset.value;
    const label = isCurrent ? `✅ ${preset.label}` : preset.label;
    const callbackData = `tz_${preset.value}`;

    keyboard.text(label, callbackData);

    // 2 buttons per row
    if ((index + 1) % 2 === 0 && index < TIMEZONE_PRESETS.length - 1) {
      keyboard.row();
    }
  });

  return keyboard;
}

/**
 * Builds a keyboard listing active reminders for editing or deletion.
 */
export function buildReminderSelectKeyboard(
  reminders: Array<{ reminder_id: string; content_text: string | null; media_type?: string }>,
  prefix: "edit_pick_" | "del_pick_"
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  reminders.forEach((r, index) => {
    const icon = prefix === "edit_pick_" ? "✏️" : "🗑️";
    const title = cleanReminderTitle(r.content_text, r.media_type, 20);
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
export function buildEditReminderMenuKeyboard(reminderId: string): InlineKeyboard {
  return new InlineKeyboard()
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
export function buildConfirmDeleteKeyboard(reminderId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("🗑️ Ha, o'chirilsin", `del_confirm_${reminderId}`)
    .text("❌ Bekor qilish", "del_cancel");
}

/**
 * Action keyboard shown under /reminders list for quick access.
 */
export function buildRemindersListKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("✏️ Tahrirlash", "cmd_edit")
    .text("🗑️ O'chirish", "cmd_delete")
    .text("🛑 To'xtatish", "cmd_stop");
}

