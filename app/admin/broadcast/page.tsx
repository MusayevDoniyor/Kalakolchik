import BroadcastComposer from "@/components/admin/BroadcastComposer";
import { Send } from "lucide-react";

export default function AdminBroadcastPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/60">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Send className="w-8 h-8 text-indigo-400" />
          Broadcast & Announcements
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Compose and broadcast announcements directly to users via Telegram Bot API
        </p>
      </div>

      <BroadcastComposer />
    </div>
  );
}
