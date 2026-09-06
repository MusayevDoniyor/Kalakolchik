"use client";

import { useState, useTransition } from "react";
import { sendBroadcastAction } from "@/app/admin/actions";
import { Send, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, Globe, Bot } from "lucide-react";

export default function BroadcastComposer() {
  const [message, setMessage] = useState(
    "🔔 <b>MindSnap Announcement</b>\n\nHello from the MindSnap team! We have updated the reminder scheduler to support exact timezones and recurring cycles.\n\nType /help to see all available commands!"
  );
  const [photoUrl, setPhotoUrl] = useState("");
  const [timezone, setTimezone] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    total: number;
    sent: number;
    failed: number;
    errors: Array<{ telegramId: number; error: string }>;
  } | null>(null);

  const insertTag = (open: string, close: string) => {
    setMessage((prev) => `${prev}${open}text${close}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (
      !confirm(
        `Are you sure you want to broadcast this message to ${
          timezone === "all" ? "ALL users" : `users in ${timezone}`
        }?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await sendBroadcastAction({
          messageText: message,
          photoUrl: photoUrl.trim() || undefined,
          parseMode: "HTML",
          targetTimezone: timezone,
        });
        setResult(res);
      } catch (err: any) {
        alert(err.message || "Broadcast failed");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Input Section */}
      <div className="bg-[#0c1017]/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            Message Composer
          </h2>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded">
            HTML Mode
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Audience Filter
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">All Users (Global Broadcast)</option>
                <option value="Asia/Tashkent">Asia/Tashkent (Uzbekistan)</option>
                <option value="Europe/Moscow">Europe/Moscow</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Photo URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/banner.png"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Message Text with HTML helpers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Message Content
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertTag("<b>", "</b>")}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<i>", "</i>")}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] italic font-serif"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<code>", "</code>")}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono"
                >
                  &lt;/&gt;
                </button>
                <button
                  type="button"
                  onClick={() => setMessage((prev) => prev + " 🔔 ")}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                >
                  🔔
                </button>
              </div>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Write your broadcast message here..."
              className="w-full p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Dispatching messages to users (Rate-limited safe)...
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast Now</span>
              </>
            )}
          </button>
        </form>

        {/* Result Status Card */}
        {result && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Broadcast Complete
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-lg font-bold text-white">{result.total}</p>
                <p className="text-[10px] text-slate-400 uppercase">Targeted</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-lg font-bold text-emerald-400">{result.sent}</p>
                <p className="text-[10px] text-emerald-300 uppercase">Delivered</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-lg font-bold text-rose-400">{result.failed}</p>
                <p className="text-[10px] text-rose-300 uppercase">Failed</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3 text-[11px] text-rose-400 space-y-1 max-h-24 overflow-y-auto">
                {result.errors.slice(0, 5).map((e, idx) => (
                  <p key={idx}>User {e.telegramId}: {e.error}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Telegram Chat Bubble Simulation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Telegram Message Preview
          </h3>
          <span className="text-[11px] text-slate-500">Live Render</span>
        </div>

        {/* Telegram Chat Mockup */}
        <div className="w-full rounded-2xl bg-[#17212b] border border-slate-800/80 p-6 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col justify-end">
          {/* Mockup Chat Header */}
          <div className="absolute top-0 left-0 right-0 p-3 bg-[#232e3c] border-b border-slate-700/60 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">MindSnap Bot</p>
              <p className="text-[10px] text-slate-400">bot • official</p>
            </div>
          </div>

          {/* Chat Bubble */}
          <div className="max-w-[85%] bg-[#182533] border border-slate-700/40 rounded-2xl rounded-bl-sm p-3.5 shadow-lg space-y-3 mt-12">
            {photoUrl.trim() && (
              <div className="rounded-xl overflow-hidden aspect-video bg-black/40 border border-slate-700/50">
                <img
                  src={photoUrl}
                  alt="Broadcast preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div
              className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed space-y-2 [&_b]:font-bold [&_b]:text-white [&_i]:italic [&_code]:font-mono [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded"
              dangerouslySetInnerHTML={{
                __html: message.trim() || "<span class='text-slate-500'>Your message will appear here...</span>",
              }}
            />

            <div className="text-right text-[10px] text-slate-400 flex items-center justify-end gap-1">
              <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="text-cyan-400 font-bold">✓✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
