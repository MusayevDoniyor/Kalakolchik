import { getRemindersList } from "@/app/admin/actions";
import ReminderRowActions from "@/components/admin/ReminderRowActions";
import {
  BellRing,
  Search,
  Filter,
  Repeat,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Mic,
  Video,
} from "lucide-react";
import Link from "next/link";

interface RemindersPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    search?: string;
  }>;
}

export default async function AdminRemindersPage({ searchParams }: RemindersPageProps) {
  const params = await searchParams;
  const status = params.status || "all";
  const type = params.type || "all";
  const search = params.search || "";

  const reminders = await getRemindersList({
    status,
    isRecurring: type,
    search,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <BellRing className="w-8 h-8 text-indigo-400" />
            Reminders & Cycles
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor, reschedule, manually trigger, and stop recurring cycles ({reminders.length} items found)
          </p>
        </div>

        {/* Search */}
        <form className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search caption or User ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {type !== "all" && <input type="hidden" name="type" value={type} />}
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c1017]/80 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Status:
          </span>
          {["all", "pending", "sent", "stopped"].map((st) => (
            <Link
              key={st}
              href={`/admin/reminders?status=${st}&type=${type}&search=${encodeURIComponent(search)}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                status === st
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Type:
          </span>
          {[
            { key: "all", label: "All" },
            { key: "recurring", label: "Recurring Cycles" },
            { key: "once", label: "One-Time" },
          ].map((t) => (
            <Link
              key={t.key}
              href={`/admin/reminders?status=${status}&type=${t.key}&search=${encodeURIComponent(search)}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                type === t.key
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-[#0c1017]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Memory / Caption</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Scheduled (UTC)</th>
                <th className="px-6 py-4">Cycle Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {reminders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No reminders found matching your filters.
                  </td>
                </tr>
              ) : (
                reminders.map((rem: any) => {
                  const mem = rem.memories;
                  const tgId = mem?.users?.telegram_id || "Unknown";
                  const mediaType = mem?.media_type || "text";
                  const dateStr = rem.scheduled_at
                    ? new Date(rem.scheduled_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "UTC",
                      }) + " UTC"
                    : "Unscheduled";

                  const intervalDesc = rem.recurring_interval_minutes
                    ? `${rem.recurring_interval_minutes} mins`
                    : "No interval";

                  return (
                    <tr key={rem.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <span className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                            {mediaType === "image" ? (
                              <ImageIcon className="w-3.5 h-3.5" />
                            ) : mediaType === "voice" ? (
                              <Mic className="w-3.5 h-3.5" />
                            ) : mediaType === "video" ? (
                              <Video className="w-3.5 h-3.5" />
                            ) : (
                              <FileText className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                              {mem?.content_text || "(No caption)"}
                            </p>
                            {mem?.media_url && (
                              <a
                                href={mem.media_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                View Media Asset
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-white font-semibold block">
                          {tgId}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {mem?.users?.timezone || "Asia/Tashkent"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {dateStr}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {rem.is_recurring ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/30 text-[10px] uppercase font-bold tracking-wider">
                              <Repeat className="w-3 h-3" />
                              Cycle
                            </span>
                            <p className="text-[11px] text-slate-400">{intervalDesc}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">One-Time</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                            rem.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : rem.status === "sent"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-700/40 text-slate-400 border-slate-700"
                          }`}
                        >
                          {rem.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ReminderRowActions
                          reminderId={rem.id}
                          status={rem.status}
                          isRecurring={rem.is_recurring}
                          scheduledAt={rem.scheduled_at}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
