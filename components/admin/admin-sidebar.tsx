"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  FileEdit,
  Activity,
  ShieldAlert,
  Bell,
  Settings,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/activities", label: "Activities", icon: Activity },
  { href: "/admin/content", label: "Site Content", icon: FileEdit },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/security", label: "Security Log", icon: ShieldAlert },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      id="app-sidebar"
      aria-label="Admin navigation"
      className={`fixed left-0 top-0 z-50 flex h-screen w-[248px] max-w-[85vw] flex-col border-r border-[#e6e8f0] bg-white transition-transform duration-200 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-[68px] items-center justify-between border-b border-[#eef0f6] px-4 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Brand compact />
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-indigo-600">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav aria-label="Admin sections" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
          Control Center
        </p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#eef0f6] p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ImageIcon size={14} aria-hidden="true" />
          View Public Site
        </Link>
      </div>
    </aside>
  );
}
