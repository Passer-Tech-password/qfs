"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Power, Menu, createLucideIcon } from "lucide-react";

const PersonHeart = createLucideIcon("PersonHeart", [
  ["circle", { cx: "9", cy: "7", r: "4", key: "head" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2", key: "body" }],
  ["path", { d: "M19 12c-1.2-1.2-3.2-.8-3.2 1.2 0 1.2 3.2 3.3 3.2 3.3s3.2-2.1 3.2-3.3c0-2-2-2.4-3.2-1.2z", key: "heart" }],
]);

export function TopBar({
  title,
  onOpenSignOut,
  onOpenNav,
  navOpen = false,
}: {
  title: string;
  onOpenSignOut: () => void;
  onOpenNav?: () => void;
  navOpen?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between gap-3 border-b border-[#e6e8f0] bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          aria-expanded={navOpen}
          aria-controls="app-sidebar"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#e6e8f0] text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={18} />
        </button>
        <h1 className="truncate text-[17px] font-bold tracking-tight text-[#161829] sm:text-[20px]">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <Link href="/dashboard/notifications" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e8f0] text-slate-500 transition hover:bg-slate-50">
          <Settings size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 animate-quantum-blink" />
        </Link>
        <Link href="/dashboard/profile" aria-label="Settings" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e8f0] text-slate-500 transition hover:bg-slate-50">
          <PersonHeart size={17} />
        </Link>
        <button onClick={onOpenSignOut} aria-label="Sign out" className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50">
          <Power size={17} />
        </button>
      </div>
    </header>
  );
}
