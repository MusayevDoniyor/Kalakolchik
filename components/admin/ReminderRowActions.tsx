"use client";

import { useState, useTransition } from "react";
import {
  stopRecurringReminder,
  rescheduleReminder,
  triggerReminderNow,
  deleteReminder,
} from "@/app/admin/actions";
import { Play, Square, Calendar, Trash2, Loader2, Check } from "lucide-react";

interface ReminderRowActionsProps {
  reminderId: string;
  status: string;
  isRecurring: boolean;
  scheduledAt: string;
}

export default function ReminderRowActions({
  reminderId,
  status,
  isRecurring,
  scheduledAt,
}: ReminderRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState(() => {
    try {
      return new Date(scheduledAt).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleStop = () => {
    if (!confirm("Are you sure you want to stop this recurring cycle?")) return;
    startTransition(async () => {
      try {
        await stopRecurringReminder(reminderId);
        setFeedback("Stopped");
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        alert(err.message || "Failed to stop cycle");
      }
    });
  };

  const handleTrigger = () => {
    if (!confirm("Trigger this reminder right now via Telegram Bot?")) return;
    startTransition(async () => {
      try {
        await triggerReminderNow(reminderId);
        setFeedback("Sent");
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        alert(err.message || "Failed to trigger reminder");
      }
    });
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    startTransition(async () => {
      try {
        const iso = new Date(newDate).toISOString();
        await rescheduleReminder(reminderId, iso);
        setShowReschedule(false);
        setFeedback("Rescheduled");
        setTimeout(() => setFeedback(null), 3000);
      } catch (err: any) {
        alert(err.message || "Failed to reschedule reminder");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this reminder permanently?")) return;
    startTransition(async () => {
      try {
        await deleteReminder(reminderId);
      } catch (err: any) {
        alert(err.message || "Failed to delete reminder");
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-end gap-1.5 text-xs text-indigo-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Updating...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5 relative">
      {feedback && (
        <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mr-2 bg-emerald-500/10 px-2 py-0.5 rounded">
          <Check className="w-3 h-3" />
          {feedback}
        </span>
      )}

      {/* Trigger Now Button */}
      <button
        type="button"
        onClick={handleTrigger}
        title="Trigger Now via Telegram"
        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
      >
        <Play className="w-3.5 h-3.5" />
      </button>

      {/* Stop Recurring Button */}
      {isRecurring && status === "pending" && (
        <button
          type="button"
          onClick={handleStop}
          title="Stop Cycle"
          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Reschedule Button & Popover */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowReschedule(!showReschedule)}
          title="Reschedule Reminder"
          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>

        {showReschedule && (
          <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <form onSubmit={handleRescheduleSubmit} className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">
                New Trigger Time
              </label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={handleDelete}
        title="Delete Reminder"
        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
