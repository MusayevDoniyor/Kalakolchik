"use client";

import { useTransition } from "react";
import { deleteMemory } from "@/app/admin/actions";
import { Trash2, Loader2 } from "lucide-react";

export default function MemoryDeleteButton({ memoryId }: { memoryId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Delete this memory and its reminders permanently?")) return;
    startTransition(async () => {
      try {
        await deleteMemory(memoryId);
      } catch (err: any) {
        alert(err.message || "Failed to delete memory");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="Delete Memory"
      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
