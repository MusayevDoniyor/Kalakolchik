import { getMemoriesList } from "@/app/admin/actions";
import MemoryDeleteButton from "@/components/admin/MemoryDeleteButton";
import {
  Image as ImageIcon,
  Mic,
  Video,
  FileText,
  ExternalLink,
  Calendar,
  User,
  BellRing,
} from "lucide-react";
import Link from "next/link";

interface MemoriesPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function AdminMemoriesPage({ searchParams }: MemoriesPageProps) {
  const params = await searchParams;
  const mediaType = params.type || "all";
  const memories = await getMemoriesList(mediaType);

  const filterTabs = [
    { key: "all", label: "All Formats" },
    { key: "image", label: "Images" },
    { key: "voice", label: "Voice Notes" },
    { key: "video", label: "Videos" },
    { key: "text", label: "Text Notes" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-indigo-400" />
            Memories & Media Gallery
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse stored media, prompts, and audio notes ({memories.length} items)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0c1017]/80 p-1.5 rounded-2xl border border-slate-800/80">
          {filterTabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/memories?type=${tab.key}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mediaType === tab.key
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid of Memories */}
      {memories.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 text-center text-slate-500">
          No memories found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((mem: any) => {
            const tgId = mem.users?.telegram_id || "Unknown";
            const remindersCount = (mem.reminders || []).length;
            const createdStr = mem.created_at
              ? new Date(mem.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No date";

            return (
              <div
                key={mem.id}
                className="rounded-2xl bg-[#0c1017]/80 border border-slate-800/80 overflow-hidden backdrop-blur-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                {/* Media Preview Container */}
                <div>
                  {mem.media_type === "image" && mem.media_url ? (
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden border-b border-slate-800/60 group">
                      <img
                        src={mem.media_url}
                        alt="Memory preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <a
                        href={mem.media_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white text-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : mem.media_type === "voice" && mem.media_url ? (
                    <div className="p-4 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-b border-slate-800/60 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                        <Mic className="w-4 h-4" />
                        <span>Voice Recording</span>
                      </div>
                      <audio controls className="w-full mt-1 h-9 rounded-lg">
                        <source src={mem.media_url} />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  ) : mem.media_type === "video" && mem.media_url ? (
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden border-b border-slate-800/60">
                      <video controls className="w-full h-full object-cover">
                        <source src={mem.media_url} />
                      </video>
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-950 border-b border-slate-800/60 flex items-center gap-2 text-xs font-semibold text-indigo-400">
                      <FileText className="w-4 h-4" />
                      <span>Text Memory</span>
                    </div>
                  )}

                  {/* Caption & Content Body */}
                  <div className="p-5">
                    <p className="text-sm font-medium text-slate-200 line-clamp-3 leading-relaxed">
                      {mem.content_text || "(No caption provided)"}
                    </p>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="px-5 py-3.5 bg-slate-900/50 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <User className="w-3 h-3 text-slate-500" />
                      {tgId}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {createdStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      <BellRing className="w-3 h-3" />
                      {remindersCount}
                    </span>
                    <MemoryDeleteButton memoryId={mem.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
