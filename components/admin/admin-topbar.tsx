"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Bell, Power, ShieldCheck, Menu } from "lucide-react";
import { getFirebaseClients } from "@/lib/firebase/client";

export function AdminTopBar({
  title,
  onOpenNav,
  navOpen = false,
}: {
  title: string;
  onOpenNav?: () => void;
  navOpen?: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      const { auth } = getFirebaseClients();
      await signOut(auth);
    } catch {
      // ignore
    } finally {
      router.push("/admin/login");
    }
  }

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
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 sm:inline-flex">
          <ShieldCheck size={11} /> Admin
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e8f0] text-slate-500 transition hover:bg-slate-50"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 animate-quantum-blink" />
        </button>
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-500 transition hover:bg-rose-50"
        >
          <Power size={17} />
        </button>
      </div>
    </header>
  );
}
