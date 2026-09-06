"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Mic,
  Video,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Shield,
  Repeat,
  Check,
  ChevronDown,
  Terminal,
  Send,
  Sliders,
  Copy,
  Globe2,
} from "lucide-react";

export default function Home() {
  const [activeMediaTab, setActiveMediaTab] = useState<"voice" | "circle" | "document">("voice");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const faqs = [
    {
      q: "How does the AI voice scheduling work?",
      a: "MindSnap uses Google Gemini Flash to transcribe and interpret your voice notes in real-time. Whether you speak in Uzbek, English, or Russian (e.g. 'Ertaga soat 10 da dori ichishni eslat'), it accurately extracts the task, target date, time, and recurrence without manual typing.",
    },
    {
      q: "Can I send circular video notes (Dumaloq video)?",
      a: "Yes! MindSnap natively supports Telegram's circle video messages (video_notes). Send a circle video directly from your camera, add an optional voice or text note, and MindSnap will deliver it back in circular format when due.",
    },
    {
      q: "What other media formats can I store?",
      a: "You can send voice recordings, circular videos, standard videos, high-resolution photos, documents (PDFs, Word files, spreadsheets), and plain text notes. Everything is securely stored in Supabase cloud storage.",
    },
    {
      q: "Can I edit or cancel reminders after creating them?",
      a: "Absolutely. Send /reminders to view your active queue, /edit to modify the note, date, time, or recurrence of any reminder, or /delete to cancel them with a single tap.",
    },
    {
      q: "How does timezone handling work?",
      a: "By default, MindSnap uses Asia/Tashkent (UTC+5), but you can set any global timezone using the /timezone command. All reminders automatically respect wall-clock time across seasonal changes.",
    },
  ];

  const commands = [
    { cmd: "/start", desc: "Launch bot and get your profile setup" },
    { cmd: "/new", desc: "Create a new memory and schedule a reminder" },
    { cmd: "/reminders", desc: "View all your active & recurring reminders" },
    { cmd: "/edit", desc: "Interactively update note, date, time, or cycle" },
    { cmd: "/delete", desc: "Remove an existing reminder or series" },
    { cmd: "/stop", desc: "List and stop recurring repetition cycles" },
    { cmd: "/timezone", desc: "Check or update your local timezone" },
    { cmd: "/help", desc: "Open the interactive user manual and tips" },
  ];

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-96 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[800px] -right-48 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#06080d]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              MindSnap
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                Bot
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#commands" className="hover:text-white transition-colors">
              Commands
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              Admin Portal
            </Link>
            <a
              href="https://t.me/yeeeeeaah_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2 rounded-lg shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer"
            >
              <span>Open in Telegram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-7">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">
              Live on Telegram • Powered by Google Gemini Flash
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Remember everything.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Never lose an important thought.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            MindSnap is your intelligent second brain inside Telegram. Speak your thoughts, record circle videos, or attach files. AI schedules smart spaced repetition reminders right when you need them.
          </p>

          {/* CTA Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="https://t.me/yeeeeeaah_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer group"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Launch @yeeeeeaah_bot</span>
            </a>
            <a
              href="#workflow"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-6 py-3.5 rounded-xl transition-all"
            >
              <span>See How It Works</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Prompt Suggestion Pill */}
          <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-2 flex-wrap">
            <span>Try speaking:</span>
            <code className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-[11px]">
              &quot;Ertaga soat 10:00 da dori ichishni eslat&quot;
            </code>
          </div>
        </div>

        {/* Telegram Chat Mockup Preview */}
        <div className="max-w-2xl mx-auto mt-16 relative">
          <div className="p-1 rounded-3xl bg-gradient-to-b from-slate-800/80 via-slate-800/30 to-transparent shadow-2xl shadow-black/80">
            <div className="bg-[#0b0f17] border border-slate-800/90 rounded-[22px] overflow-hidden">
              {/* Telegram Window Top Bar */}
              <div className="px-5 py-3.5 bg-[#0e141f] border-b border-slate-800/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-xs">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0e141f]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">MindSnap</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1 py-0.2 rounded font-medium">
                        bot
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-medium">bot is online</p>
                  </div>
                </div>

                {/* Media Switcher Tab */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setActiveMediaTab("voice")}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeMediaTab === "voice"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Voice
                  </button>
                  <button
                    onClick={() => setActiveMediaTab("circle")}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeMediaTab === "circle"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Circle Video
                  </button>
                  <button
                    onClick={() => setActiveMediaTab("document")}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeMediaTab === "document"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Document
                  </button>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="p-6 space-y-4 text-xs font-sans">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-xs bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md space-y-1.5">
                    {activeMediaTab === "voice" && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-2/3 rounded-full" />
                          </div>
                          <p className="text-[10px] text-white/80 mt-1 font-mono">0:04 • 🎙️ Ovozli eslatma</p>
                        </div>
                      </div>
                    )}

                    {activeMediaTab === "circle" && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/80 bg-white/10 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs">📹 Dumaloq video</p>
                          <p className="text-[10px] text-white/80">Circle video note • 0:08</p>
                        </div>
                      </div>
                    )}

                    {activeMediaTab === "document" && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-xs truncate">digital_sat_vocab.pdf</p>
                          <p className="text-[10px] text-white/80">2.4 MB • Document</p>
                        </div>
                      </div>
                    )}
                    <div className="text-right text-[10px] text-indigo-200">10:42 AM ✓✓</div>
                  </div>
                </div>

                {/* Bot Response Card */}
                <div className="flex justify-start">
                  <div className="max-w-sm bg-[#121824] border border-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-xl space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-xs text-white">🧠 Eslatma ko&apos;rinishi</span>
                    </div>

                    <div className="space-y-2 text-[11px] leading-relaxed">
                      <div>
                        <span className="text-slate-400">📎 Tarkib:</span>{" "}
                        <span className="font-semibold text-indigo-300">
                          {activeMediaTab === "voice" && "🎙️ Ovozli xabar"}
                          {activeMediaTab === "circle" && "📹 Dumaloq video (Video note)"}
                          {activeMediaTab === "document" && "📄 Hujjat / Fayl (digital_sat_vocab.pdf)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">🎯 Harakat:</span>{" "}
                        <span className="font-medium text-slate-100">
                          Lug&apos;atni 3-qadam takrorlash va test topshirish
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-300 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Ertaga, 07-Sentabr
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          10:00
                        </span>
                      </div>
                      <div className="text-slate-400 flex items-center gap-1 text-[10px]">
                        <Globe2 className="w-3 h-3 text-slate-500" />
                        Asia/Tashkent (UTC+5)
                      </div>
                    </div>

                    {/* Telegram Inline Buttons */}
                    <div className="space-y-1.5 pt-1">
                      <button className="w-full py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ha, rejalashtirilsin</span>
                      </button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button className="py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 font-medium text-[10px] transition-colors">
                          ✏️ O&apos;zgartirish
                        </button>
                        <button className="py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700/60 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 font-medium text-[10px] transition-colors">
                          ❌ Bekor qilish
                        </button>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-500">10:42 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Bento Grid */}
      <section id="features" className="py-24 px-6 border-t border-slate-800/80 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">
              High-Precision Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for seamless recall.
            </p>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Every detail is designed to remove friction from capturing ideas and turning them into long-term knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1: Large Span */}
            <div className="md:col-span-2 p-7 rounded-2xl bg-[#0c1017] border border-slate-800/80 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Voice AI Intelligence (Gemini Flash)
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg mb-6">
                Just speak your intention. MindSnap transcribes Uzbek, English, and multilingual audio memos, understanding complex scheduling cues like &quot;Ertaga soat 9:00 da&quot; or &quot;Har seshanba 15:30 da&quot;.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <span>Zero manual typing required</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-[#0c1017] border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-5">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Circular Video Notes</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Native support for Telegram&apos;s circular video messages (`video_note`). Re-delivered natively in circular bubble format when your reminder triggers.
              </p>
              <span className="text-xs font-semibold text-violet-400">Native Telegram format</span>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-[#0c1017] border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Spaced Repetition & Cycles</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Fight the forgetting curve. Select 1-day, 3-day, or 1-week intervals, or setup recurring daily or weekly notification cadences.
              </p>
              <span className="text-xs font-semibold text-cyan-400">Scientific memory retention</span>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-[#0c1017] border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">In-Bot Edit & Delete</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Need to reschedule? Use <code className="text-amber-300 font-mono text-xs">/edit</code> to change date, time, or frequency with inline buttons, or <code className="text-amber-300 font-mono text-xs">/delete</code> to remove items.
              </p>
              <span className="text-xs font-semibold text-amber-400">Full control via chat</span>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-[#0c1017] border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Cloud Sync</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Stored safely in PostgreSQL with Supabase encrypted media storage. Zero risk of losing valuable reminders even if you change devices.
              </p>
              <span className="text-xs font-semibold text-emerald-400">Persistent & Reliable</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="workflow" className="py-24 px-6 bg-[#080c13] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">
              Effortless Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three steps to never forgetting again.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800 relative">
              <div className="text-4xl font-black text-indigo-500/20 mb-4 font-mono">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Capture Anything</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Drop in a voice message, record a circle video, send a document (PDF, DOCX), photo, or text note straight to the bot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800 relative">
              <div className="text-4xl font-black text-violet-500/20 mb-4 font-mono">02</div>
              <h3 className="text-lg font-bold text-white mb-2">State Your Timing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Speak naturally or tap one-click inline buttons (1 Day, 3 Days, Daily, or Custom Time). Gemini AI calculates the exact delivery schedule.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#0c1017]/80 border border-slate-800 relative">
              <div className="text-4xl font-black text-cyan-500/20 mb-4 font-mono">03</div>
              <h3 className="text-lg font-bold text-white mb-2">Recall on Schedule</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Right on time, MindSnap pushes a Telegram notification with your original media and action item attached, reinforcing memory retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commands Reference Cheat Sheet */}
      <section id="commands" className="py-24 px-6 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">
              Command Reference
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Instant controls at your fingertips.
            </p>
            <p className="text-sm text-slate-400">
              Click any command to copy it directly to your clipboard.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/90 bg-[#0c1017] divide-y divide-slate-800/80 overflow-hidden shadow-xl">
            {commands.map((item) => (
              <div
                key={item.cmd}
                onClick={() => copyToClipboard(item.cmd)}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-mono text-xs sm:text-sm font-bold text-indigo-300 group-hover:text-indigo-200">
                    {item.cmd}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 text-right hidden sm:inline">
                    {item.desc}
                  </span>
                  <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
                    {copiedCommand === item.cmd ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#080c13] border-t border-slate-800/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">FAQ</h2>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-[#0c1017] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 border-t border-slate-800/80 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-indigo-950/40 via-[#0c1017] to-violet-950/30 border border-indigo-500/20 shadow-2xl relative">
          <div className="space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to supercharge your memory?
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Start capturing with MindSnap today. Available 24/7 on Telegram with zero setup required.
            </p>
            <div className="pt-2">
              <a
                href="https://t.me/yeeeeeaah_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Start using @yeeeeeaah_bot</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 px-6 bg-[#040609] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">MindSnap</span>
            <span>•</span>
            <span>AI Memory &amp; Spaced Repetition</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://t.me/yeeeeeaah_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Telegram Bot
            </a>
            <Link href="/admin" className="hover:text-slate-300 transition-colors">
              Admin Portal
            </Link>
            <a
              href="https://github.com/OtabekAbduvaliyev/MindSnap"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub
            </a>
          </div>

          <div>
            <span>© 2026 MindSnap. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
