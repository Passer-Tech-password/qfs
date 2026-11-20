import Link from "next/link";
import {
  Home, DollarSign, Repeat, Send, CreditCard, TrendingUp,
  Flag, Wallet, Ticket, Clock, Settings, Plus,
} from "lucide-react";

type Action = {
  label: string;
  href: string;
  icon: typeof Home;
  bg: string;
  color: string;
};

const row1: Action[] = [
  { label: "Home", href: "/dashboard", icon: Home, bg: "bg-violet-100", color: "text-violet-600" },
  { label: "Deposit", href: "/dashboard/deposit/new", icon: DollarSign, bg: "bg-amber-100", color: "text-amber-600" },
  { label: "Swap", href: "/dashboard/swap", icon: Repeat, bg: "bg-sky-100", color: "text-sky-600" },
  { label: "Send", href: "/dashboard/send", icon: Send, bg: "bg-emerald-100", color: "text-emerald-600" },
  { label: "Card", href: "/dashboard/qfs-card", icon: CreditCard, bg: "bg-amber-100", color: "text-amber-600" },
  { label: "Invest", href: "/dashboard/fixed-deposit/new", icon: TrendingUp, bg: "bg-pink-100", color: "text-pink-600" },
];

const row2: Action[] = [
  { label: "Dispute", href: "/dashboard/dispute", icon: Flag, bg: "bg-amber-100", color: "text-amber-600" },
  { label: "Payout", href: "/dashboard/payout/request", icon: Wallet, bg: "bg-sky-100", color: "text-sky-600" },
  { label: "Ticket", href: "/dashboard/tickets", icon: Ticket, bg: "bg-indigo-100", color: "text-indigo-600" },
  { label: "History", href: "/dashboard/transfers", icon: Clock, bg: "bg-amber-100", color: "text-amber-600" },
  { label: "Settings", href: "/dashboard/profile", icon: Settings, bg: "bg-pink-100", color: "text-pink-600" },
  { label: "More", href: "/dashboard/kyc", icon: Plus, bg: "bg-slate-100", color: "text-slate-600" },
];

function ActionTile({ action }: { action: Action }) {
  const Icon = action.icon;
  return (
    <Link
      href={action.href}
      className="flex flex-col items-center gap-2 rounded-xl py-3 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.bg}`}>
        <Icon size={20} className={action.color} />
      </span>
      <span className="text-[12px] font-semibold text-slate-700">{action.label}</span>
    </Link>
  );
}

export function QuickActions() {
  return (
    <section className="dash-card mt-6 p-6">
      <h2 className="text-[18px] font-bold text-slate-900">Quick Actions</h2>
      <p className="mt-0.5 text-[12.5px] text-slate-500">Direct shortcuts to your daily operations</p>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {row1.map((a) => (
          <ActionTile key={a.label} action={a} />
        ))}
      </div>
      <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {row2.map((a) => (
          <ActionTile key={a.label} action={a} />
        ))}
      </div>
    </section>
  );
}
