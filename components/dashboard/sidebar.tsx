"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, LayoutDashboard, HandCoins, Banknote, Send, Download, Repeat, ShieldCheck, Flag, QrCode, CreditCard, Ticket, FileText, Receipt, Wallet, MoreHorizontal, HelpCircle, X } from "lucide-react";
import { Brand } from "@/components/brand";

type NavChild = { label: string; href: string };
type NavItem = {
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
  children?: NavChild[];
};

const dashboardNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

const contentNav: NavItem[] = [
  {
    label: "Fixed Deposit",
    icon: HandCoins,
    children: [
      { label: "New Fixed Deposit", href: "/dashboard/fixed-deposit/new" },
      { label: "My Fixed Deposits", href: "/dashboard/fixed-deposits" },
    ],
  },
  {
    label: "Deposit",
    icon: Banknote,
    children: [
      { label: "Deposit Now", href: "/dashboard/deposit/new" },
      { label: "Deposit List", href: "/dashboard/deposits" },
    ],
  },
  {
    label: "Send Money",
    icon: Send,
    children: [
      { label: "Send Money", href: "/dashboard/send" },
      { label: "Transfer List", href: "/dashboard/transfers" },
    ],
  },
  { label: "Request Money", icon: Download, children: [
    { label: "New Request", href: "/dashboard/request/new" },
    { label: "All Request", href: "/dashboard/requests" },
  ] },
  { label: "Swap Assets", icon: Repeat, children: [
    { label: "Swap", href: "/dashboard/swap" },
    { label: "All Swap", href: "/dashboard/swaps" },
  ] },
  { label: "Escrow", icon: ShieldCheck, children: [
    { label: "Create a request", href: "/dashboard/escrow/new" },
    { label: "Escrow List", href: "/dashboard/escrows" },
  ] },
  { label: "Dispute", icon: Flag, href: "/dashboard/dispute" },
  { label: "QR Payment", icon: QrCode, children: [
    { label: "Make Payment", href: "/dashboard/qr-payment" },
    { label: "QR Payment List", href: "/dashboard/qr-payments" },
  ] },
  { label: "QFS Card", icon: CreditCard, href: "/dashboard/qfs-card" },
  { label: "Voucher", icon: Ticket, children: [
    { label: "Create Voucher", href: "/dashboard/voucher/create" },
    { label: "Redeem Voucher", href: "/dashboard/voucher/redeem" },
    { label: "Voucher List", href: "/dashboard/vouchers" },
  ] },
  { label: "Invoice", icon: FileText, children: [
    { label: "Create Invoice", href: "/dashboard/invoice/create" },
    { label: "Invoice List", href: "/dashboard/invoices" },
  ] },
  { label: "Bill", icon: Receipt, children: [
    { label: "Pay Bill", href: "/dashboard/bill/pay" },
    { label: "Bill List", href: "/dashboard/bills" },
  ] },
  { label: "Payout", icon: Wallet, children: [
    { label: "Request Payout", href: "/dashboard/payout/request" },
    { label: "Payout List", href: "/dashboard/payouts" },
  ] },
];

const moreNav: NavItem[] = [
  {
    label: "More",
    icon: MoreHorizontal,
    children: [
      { label: "Tickets", href: "/dashboard/tickets" },
      { label: "KYC Verification", href: "/dashboard/kyc" },
      { label: "2FA Security", href: "/dashboard/security" },
      { label: "Push Notify Setting", href: "/dashboard/notifications" },
      { label: "Profile", href: "/dashboard/profile" },
    ],
  },
];

function NavLink({ item, onLogout }: { item: NavItem; onLogout?: () => void }) {
  const pathname = usePathname();
  const hasChildren = !!item.children;
  const [open, setOpen] = useState(
    hasChildren && item.children!.some((c) => pathname?.startsWith(c.href)),
  );

  const Icon = item.icon;
  const isActiveLeaf = item.href ? pathname === item.href : false;
  const hasActiveChild =
    hasChildren && item.children!.some((c) => pathname?.startsWith(c.href));

  if (item.label === "Logout") {
    return (
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-rose-300 transition hover:bg-white/5"
      >
        <LogOut size={17} />
        Logout
      </button>
    );
  }

  return (
    <div>
      {item.href ? (
        <Link
          href={item.href}
          aria-current={isActiveLeaf ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${
            isActiveLeaf
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon size={17} />
          {item.label}
        </Link>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition ${
            hasActiveChild
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon size={17} />
          <span className="flex-1">{item.label}</span>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {hasChildren && open && item.children!.length > 0 && (
        <div className="mt-1 space-y-0.5 pl-9">
          {item.children!.map((child) => {
            const active = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-[12.5px] font-medium transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}

      {hasChildren && open && item.children!.length === 0 && (
        <p className="mt-1 pl-9 text-[11px] text-slate-500">Coming soon</p>
      )}
    </div>
  );
}

export function Sidebar({
  onLogout,
  open = false,
  onClose,
}: {
  onLogout?: () => void;
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside
      id="app-sidebar"
      aria-label="Dashboard navigation"
      className={`dash-sidebar scrollbar-thin fixed inset-y-0 left-0 z-50 flex w-[248px] max-w-[85vw] flex-col overflow-y-auto pb-24 pt-4 transition-transform duration-200 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-5 pb-5">
        <Link href="/dashboard" aria-label="Quantum Finance dashboard">
          <Brand compact />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav aria-label="Dashboard sections" className="flex-1 space-y-5 px-3">
        <div>
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Dashboard
          </p>
          <div className="space-y-0.5">
            {dashboardNav.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Manage Content
          </p>
          <div className="space-y-0.5">
            {contentNav.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div>
          <div className="space-y-0.5">
            {moreNav.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </div>

        <div className="px-1 pt-2">
          <NavLink item={{ label: "Logout", icon: LogOut }} onLogout={onLogout} />
        </div>
      </nav>

      <div className="pointer-events-none fixed bottom-3 left-3 w-[228px]">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/30">
            <HelpCircle size={16} className="text-indigo-200" />
          </div>
          <div className="leading-tight">
            <p className="text-[12px] font-semibold text-white">Need help?</p>
            <p className="text-[10.5px] text-slate-400">Contact our support team</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
