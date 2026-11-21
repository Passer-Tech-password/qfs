"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Settings, Power, Wallet, Menu } from "lucide-react";
import { ConnectWalletModal } from "@/components/dashboard/connect-wallet-modal";

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
  const [walletOpen, setWalletOpen] = useState(false);

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
        <button
          onClick={() => setWalletOpen(true)}
          aria-label="Connect Wallet"
          aria-haspopup="dialog"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 text-[12.5px] font-semibold text-indigo-700 transition hover:bg-indigo-100 sm:px-4"
        >
          <Wallet size={16} />
          <span className="hidden whitespace-nowrap sm:inline">Connect Wallet</span>
        </button>
        <Link href="/dashboard/notifications" aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e8f0] text-slate-500 transition hover:bg-slate-50">
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 animate-quantum-blink" />
        </Link>
        <Link href="/dashboard/profile" aria-label="Settings" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e8f0] text-slate-500 transition hover:bg-slate-50">
          <Settings size={17} />
        </Link>
        <button onClick={onOpenSignOut} aria-label="Sign out" className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50">
          <Power size={17} />
        </button>
      </div>
      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  );
}
