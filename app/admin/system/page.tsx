import { getSystemHealth } from "@/app/admin/actions";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Bot,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // always fetch fresh status

export default async function AdminSystemPage() {
  const health = await getSystemHealth();

  const envChecks = [
    {
      name: "Supabase Database & Storage",
      status: Boolean(
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      ),
      detail: health.database.status === "healthy" ? `Healthy (${health.database.latencyMs}ms)` : "Unavailable",
    },
    {
      name: "Telegram Bot API Token",
      status: Boolean(
        process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN
      ),
      detail: health.telegramBot.status === "connected" ? `@${health.telegramBot.username}` : "Invalid / Disconnected",
    },
    {
      name: "Google Gemini Flash API",
      status: Boolean(process.env.GEMINI_API_KEY),
      detail: process.env.GEMINI_API_KEY ? "Configured" : "Missing key",
    },
    {
      name: "Admin Authentication System",
      status: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
      detail: process.env.ADMIN_EMAIL || "otabekabduvaliyev1910@gmail.com",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-400" />
            System Health & Diagnostics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time infrastructure health, latency checks, and bot scheduler diagnostics
          </p>
        </div>

        <Link
          href="/admin/system"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Diagnostics</span>
        </Link>
      </div>

      {/* Main Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database Status */}
        <div className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            {health.database.status === "healthy" ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Operational
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" />
                Unreachable
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Supabase PostgreSQL</h3>
            <p className="text-xs text-slate-400 mt-1">
              Response Latency: <span className="text-slate-200 font-mono font-semibold">{health.database.latencyMs}ms</span>
            </p>
          </div>
        </div>

        {/* Telegram Bot API */}
        <div className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            {health.telegramBot.status === "connected" ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" />
                Error
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Telegram Gateway</h3>
            <p className="text-xs text-slate-400 mt-1">
              Bot Handle:{" "}
              <span className="text-cyan-300 font-mono font-semibold">
                @{health.telegramBot.username || "MindSnap"}
              </span>
            </p>
          </div>
        </div>

        {/* Scheduler Status */}
        <div className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Clock className="w-5 h-5" />
            </div>
            {health.scheduler.status === "nominal" ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                On Track
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                Lag Detected
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Scheduler Queue</h3>
            <p className="text-xs text-slate-400 mt-1">
              Overdue Pending Jobs:{" "}
              <span
                className={`font-mono font-semibold ${
                  health.scheduler.overduePendingCount > 0
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {health.scheduler.overduePendingCount}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Checklist */}
      <div className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 backdrop-blur-xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Environment & Security Configuration
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Verification of required environment variables for bot and dashboard runtime
        </p>

        <div className="divide-y divide-slate-800/60">
          {envChecks.map((item) => (
            <div key={item.name} className="py-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-200 font-medium">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono">{item.detail}</span>
                {item.status ? (
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-1 rounded-full bg-rose-500/10 text-rose-400">
                    <XCircle className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
