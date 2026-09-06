import { getUsersList } from "@/app/admin/actions";
import { Users, Search, Globe, Database, BellRing, Calendar, Send } from "lucide-react";
import Link from "next/link";

interface UsersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const { q } = await searchParams;
  const users = await getUsersList(q);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            User Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and monitor all {users.length} registered Telegram users and their activity
          </p>
        </div>

        {/* Search Bar Form */}
        <form className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Search by Telegram ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </form>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-[#0c1017]/80 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Telegram ID</th>
                <th className="px-6 py-4">Timezone</th>
                <th className="px-6 py-4">Memories</th>
                <th className="px-6 py-4">Active Reminders</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const regDate = u.created_at
                    ? new Date(u.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Unknown";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-white flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500" />
                        {u.telegram_id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-medium">
                          <Globe className="w-3 h-3 text-cyan-400" />
                          {u.timezone}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                          <Database className="w-3.5 h-3.5 text-amber-400" />
                          {u.memories_count} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <BellRing
                            className={`w-3.5 h-3.5 ${
                              u.active_reminders_count > 0
                                ? "text-violet-400"
                                : "text-slate-500"
                            }`}
                          />
                          <span
                            className={
                              u.active_reminders_count > 0
                                ? "text-violet-300"
                                : "text-slate-500"
                            }
                          >
                            {u.active_reminders_count} pending
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {regDate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/reminders?search=${u.telegram_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold transition-all"
                        >
                          View Reminders
                        </Link>
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
