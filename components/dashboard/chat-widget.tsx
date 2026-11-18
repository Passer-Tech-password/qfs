"use client";

import { MessageCircle } from "lucide-react";

export function ChatWidget() {
  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
        <MessageCircle size={13} />
        Live support
      </div>
      <button
        aria-label="Open support chat"
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition hover:scale-105 hover:bg-indigo-700"
      >
        <MessageCircle size={20} />
        <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
      </button>
    </div>
  );
}
