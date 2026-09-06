import Link from "next/link";
import { getDashboardStats } from "@/app/admin/actions";
import {
  Users,
  RefreshCw,
  CalendarClock,
  Database,
  Send,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Mic,
  Video,
} from "lucide-react";

export const revalidate = 10; // revalidate page every 10 seconds

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const mediaTotal =
    stats.mediaBreakdown.text +
    stats.mediaBreakdown.image +
    stats.mediaBreakdown.voice +
    stats.mediaBreakdown.video || 1;

  const mediaTypes = [
    {
      name: "Text Notes",
      count: stats.mediaBreakdown.text,
      icon: FileText,
      color: "from-blue-500 to-indigo-500",
      textColor: "text-blue-400",
      pct: Math.round((stats.mediaBreakdown.text / mediaTotal) * 100),
    },
    {
      name: "Images",
      count: stats.mediaBreakdown.image,
      icon: ImageIcon,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      pct: Math.round((stats.mediaBreakdown.image / mediaTotal) * 100),
    },
    {
      name: "Voice Notes",
      count: stats.mediaBreakdown.voice,
      icon: Mic,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400",
      pct: Math.round((stats.mediaBreakdown.voice / mediaTotal) * 100),
    },
    {
      name: "Videos",
      count: stats.mediaBreakdown.video,
      icon: Video,
      color: "from-rose-500 to-pink-500",
      textColor: "text-rose-400",
      pct: Math.round((stats.mediaBreakdown.video / mediaTotal) * 100),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time analytics and scheduler monitoring for MindSnap
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stats.overdueCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>{stats.overdueCount} Overdue Reminder(s)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Scheduler Nominal</span>
            </div>
          )}

          <Link
            href="/admin/broadcast"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Broadcast</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats.totalUsers.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Registered Telegram users
            </p>
          </div>
        </div>

        {/* Active Cycles */}
        <div className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Cycles
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats.activeCycles.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Auto-repeating cycles
            </p>
          </div>
        </div>

        {/* Scheduled Today */}
        <div className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Due Today
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats.todayReminders.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Scheduled for today
            </p>
          </div>
        </div>

        {/* Total Memories */}
        <div className="p-5 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Memories
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {stats.totalMemories.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Saved in database
            </p>
          </div>
        </div>
      </div>

      {/* Media Type Breakdown & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Distribution Widget */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Media Formats</h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of content stored in memory</p>

            <div className="space-y-4 mt-6">
              {mediaTypes.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-slate-300 font-medium">
                        <Icon className={`w-3.5 h-3.5 ${m.textColor}`} />
                        {m.name}
                      </span>
                      <span className="font-semibold text-white">
                        {m.count} <span className="text-slate-500 font-normal">({m.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-500`}
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Media Assets</span>
            <Link
              href="/admin/memories"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Browse Gallery
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent Reminders List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Recent Reminders</h3>
              <p className="text-xs text-slate-400 mt-1">Latest reminders registered across the bot</p>
            </div>
            <Link
              href="/admin/reminders"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentReminders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No reminders registered yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {stats.recentReminders.map((rem: any) => {
                const mem = rem.memories;
                const dateStr = rem.scheduled_at
                  ? new Date(rem.scheduled_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "No date";

                return (
                  <div key={rem.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-indigo-400 shrink-0 mt-0.5">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {mem?.content_text || "(Media without text caption)"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>User ID: {mem?.users?.telegram_id || "Unknown"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {dateStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rem.is_recurring && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">
                          Cycle
                        </span>
                      )}
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                          rem.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : rem.status === "sent"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-700/40 text-slate-400 border-slate-700"
                        }`}
                      >
                        {rem.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
