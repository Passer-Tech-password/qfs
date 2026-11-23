"use client";

import { useState } from "react";
import {
  DollarSign,
  Bitcoin,
  Rocket,
  Zap,
  ChevronDown,
  Mail,
  Ticket,
} from "lucide-react";

type BalanceCard = {
  icon: typeof DollarSign;
  name: string;
  amount: string;
  unit: string;
  badge: string;
  card: string;
  iconBg: string;
  badgeTone: string;
};

const balances: BalanceCard[] = [
  {
    icon: DollarSign,
    name: "USDT",
    amount: "$0.00",
    unit: "",
    badge: "USDT",
    card: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-500",
    badgeTone: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Bitcoin,
    name: "BTC",
    amount: "0.000000",
    unit: "",
    badge: "BTC",
    card: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    badgeTone: "bg-amber-100 text-amber-700",
  },
  {
    icon: Rocket,
    name: "XLM",
    amount: "0.0000",
    unit: "",
    badge: "XLM",
    card: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-500",
    badgeTone: "bg-violet-100 text-violet-700",
  },
  {
    icon: Zap,
    name: "XRP",
    amount: "0.00",
    unit: "",
    badge: "XRP",
    card: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-500",
    badgeTone: "bg-sky-100 text-sky-700",
  },
];

const currencies = [
  { label: "USDT (Tether)", balance: "$0.00" },
  { label: "BTC (Bitcoin)", balance: "0.000000" },
  { label: "XLM (Stellar)", balance: "0.0000" },
  { label: "XRP (Ripple)", balance: "0.00" },
];

export default function CreateVoucherPage() {
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState(0);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="mx-auto max-w-[1000px]">
      {/* Available Balances */}
      <section>
        <h2 className="text-[20px] font-bold text-slate-900">Available Balances</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {balances.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.name}
                className={`rounded-2xl border p-5 ${b.card}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${b.iconBg}`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.badgeTone}`}
                  >
                    {b.badge}
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-semibold text-slate-600">
                  {b.name} Balance
                </p>
                <p className="mt-0.5 text-[24px] font-black tracking-tight text-slate-900">
                  {b.amount}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Create New Voucher */}
      <div className="dash-card mt-6 p-8">
        <div className="mx-auto max-w-[620px]">
          <h3 className="text-center text-[22px] font-bold text-slate-900">
            Create New Voucher
          </h3>

          {/* Recipient Email */}
          <div className="mt-6">
            <label className="mb-2 block text-[12.5px] font-semibold text-slate-700">
              Recipient Email (Optional)
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter recipient email address"
                className="dash-input w-full py-3.5 px-4 pr-12 text-[14px]"
              />
              <Mail
                size={17}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <p className="mt-1.5 text-[11.5px] text-slate-400">
              Leave empty for open voucher that anyone can redeem
            </p>
          </div>

          {/* Currency */}
          <div className="mt-5">
            <label className="mb-2 block text-[12.5px] font-semibold text-slate-700">
              Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(Number(e.target.value))}
                className="dash-input w-full appearance-none py-3.5 pl-4 pr-10 text-[14px] font-medium text-slate-800"
              >
                {currencies.map((c, i) => (
                  <option key={c.label} value={i}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <p className="mt-1.5 text-[11.5px] text-slate-400">
              Available Balance: {currencies[currency].balance}
            </p>
          </div>

          {/* Amount */}
          <div className="mt-5">
            <label className="mb-2 block text-[12.5px] font-semibold text-slate-700">
              Amount
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter voucher amount"
              className="dash-input w-full py-3.5 px-4 text-[14px]"
            />
            <p className="mt-1.5 text-[11.5px] text-slate-400">
              Minimum amount: 0.000001
            </p>
          </div>

          {/* Note */}
          <div className="mt-5">
            <label className="mb-2 block text-[12.5px] font-semibold text-slate-700">
              Note (Purpose) - Optional
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note describing the voucher purpose (e.g., Birthday Gift, Bonus Payment, etc.)"
              rows={4}
              className="dash-input w-full resize-y px-4 py-3 text-[14px]"
            />
            <p className="mt-1.5 text-[11.5px] text-slate-400">
              This will be stored as the voucher purpose
            </p>
          </div>

          <button
            type="button"
            className="dash-submit mt-6 w-full rounded-xl py-4 text-[15px] font-bold"
          >
            <span className="inline-flex items-center gap-2">
              <Ticket size={17} /> Create Voucher
            </span>
          </button>
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfstier-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
