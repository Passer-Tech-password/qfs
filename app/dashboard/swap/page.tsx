"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  ChevronDown,
  ArrowUpDown,
  Home,
  Banknote,
  Repeat,
  Send,
  CreditCard,
  PiggyBank,
  Flag,
  Wallet,
  Ticket,
  TrendingUp,
  Settings,
  Plus,
  Bitcoin,
  Rocket,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createSwap } from "@/lib/firebase/money";

const payAssets = [
  { symbol: "BTC", label: "Bitcoin", icon: Bitcoin, balance: "0.000000" },
  { symbol: "ETH", label: "Ethereum", icon: Rocket, balance: "0.0000" },
  { symbol: "USDT", label: "Tether USD", icon: Banknote, balance: "0.00" },
];

const receiveAssets = [
  { symbol: "XLM", label: "Stellar", icon: Rocket, balance: "0.0000" },
  { symbol: "BNB", label: "BNB", icon: Repeat, balance: "0.0000" },
  { symbol: "SOL", label: "Solana", icon: Rocket, balance: "0.0000" },
];

// Indicative USD reference prices used for the on-screen estimate only.
const usdPrices: Record<string, number> = {
  BTC: 97000,
  ETH: 3400,
  USDT: 1,
  XLM: 0.2489,
  BNB: 580,
  SOL: 180,
};

const assetBalances: Record<string, number> = {
  BTC: 0,
  ETH: 0,
  USDT: 0,
  XLM: 0,
  BNB: 0,
  SOL: 0,
};

const quickActions = [
  { label: "Home", icon: Home, bg: "bg-purple-100", color: "text-purple-600", href: "/dashboard" },
  { label: "Deposit", icon: Banknote, bg: "bg-amber-100", color: "text-amber-600", href: "/dashboard/deposit/new" },
  { label: "Swap", icon: Repeat, bg: "bg-indigo-100", color: "text-indigo-600", href: "/dashboard/swap", active: true },
  { label: "Send", icon: Send, bg: "bg-emerald-100", color: "text-emerald-600", href: "/dashboard/send" },
  { label: "Card", icon: CreditCard, bg: "bg-amber-100", color: "text-amber-600", href: "/dashboard/qfs-card" },
  { label: "Invest", icon: PiggyBank, bg: "bg-indigo-100", color: "text-indigo-600", href: "/dashboard/fixed-deposit/new" },
  { label: "Dispute", icon: Flag, bg: "bg-orange-100", color: "text-orange-600", href: "/dashboard/dispute" },
  { label: "Payout", icon: Wallet, bg: "bg-sky-100", color: "text-sky-600", href: "/dashboard/payout/request" },
  { label: "Ticket", icon: Ticket, bg: "bg-purple-100", color: "text-purple-600", href: "/dashboard/tickets" },
  { label: "History", icon: TrendingUp, bg: "bg-amber-100", color: "text-amber-600", href: "/dashboard/transfers" },
  { label: "Settings", icon: Settings, bg: "bg-indigo-100", color: "text-indigo-600", href: "/dashboard/profile" },
  { label: "More", icon: Plus, bg: "bg-slate-100", color: "text-slate-600", href: "/dashboard/kyc" },
];

export default function SwapPage() {
  const [payIndex, setPayIndex] = useState(0);
  const [receiveIndex, setReceiveIndex] = useState(0);
  const [payAmount, setPayAmount] = useState("0");
  const [quickSelected, setQuickSelected] = useState<string>("MAX");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const payAsset = payAssets[payIndex];
  const receiveAsset = receiveAssets[receiveIndex];
  const ReceiveIcon = receiveAsset.icon;

  const payPrice = usdPrices[payAsset.symbol] ?? 0;
  const receivePrice = usdPrices[receiveAsset.symbol] ?? 0;
  const rate = receivePrice > 0 ? payPrice / receivePrice : 0;
  const payValue = parseFloat(payAmount) || 0;
  const receiveValue = payValue * rate;
  const rateLabel = `1 ${payAsset.symbol} = ${rate.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })} ${receiveAsset.symbol}`;

  function handleFlip() {
    setPayIndex(receiveIndex);
    setReceiveIndex(payIndex);
    setQuickSelected("");
  }

  function applyQuick(q: string) {
    setQuickSelected(q);
    const balance = assetBalances[payAsset.symbol] ?? 0;
    const factor = q === "MAX" ? 1 : Number.parseInt(q, 10) / 100;
    setPayAmount((balance * factor).toFixed(6));
  }

  async function handleSubmit() {
    if (submitting) return;

    if (payValue <= 0) {
      setSuccess(null);
      setError("Enter an amount greater than zero to swap.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await createSwap({
        paySymbol: payAsset.symbol,
        receiveSymbol: receiveAsset.symbol,
        payAmount: payValue,
        receiveAmount: Number(receiveValue.toFixed(6)),
        rate: rateLabel,
      });
      setSuccess(
        "Swap request submitted. It now appears in your exchange history as pending review.",
      );
      setPayAmount("0");
      setQuickSelected("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not submit your swap. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Exchange Assets Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4f46e5] via-[#5b21b6] to-[#6d28d9] p-7 text-white shadow-xl">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[24px] font-black tracking-tight">Exchange Assets</h2>
            <p className="mt-1 text-[13px] text-indigo-100">
              Instant zero-slippage quantum liquidity swap.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
            <Zap size={12} className="text-yellow-300" /> Instant
          </span>
        </div>

        {/* You Pay */}
        <div className="relative mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-indigo-100">You Pay</span>
            <span className="text-[11.5px] text-indigo-200">
              Balance: {payAsset.balance} {payAsset.symbol}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <div className="relative">
              <select
                value={payIndex}
                onChange={(e) => setPayIndex(Number(e.target.value))}
                className="appearance-none rounded-xl bg-white/10 py-2 pl-9 pr-8 text-[14px] font-bold text-white outline-none"
              >
                {payAssets.map((a, i) => (
                  <option key={a.symbol} value={i} className="text-slate-900">
                    {a.symbol}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-amber-900">
                B
              </div>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/70"
              />
            </div>
            <input
              type="text"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-32 bg-transparent text-right text-[26px] font-black text-white outline-none sm:w-40"
            />
          </div>

          {/* Quick buttons */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] text-indigo-200">QUICK:</span>
            {["25%", "50%", "75%", "MAX"].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => applyQuick(q)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  quickSelected === q
                    ? "bg-amber-400 text-amber-900"
                    : "bg-white/10 text-indigo-100 hover:bg-white/15"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Swap button */}
        <div className="relative z-10 my-1 flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            aria-label="Swap assets"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg transition hover:scale-105"
          >
            <ArrowUpDown size={18} />
          </button>
        </div>

        {/* You Receive */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-indigo-100">
              You Receive (Estimated)
            </span>
            <span className="text-[11.5px] text-indigo-200">
              Balance: {receiveAsset.balance} {receiveAsset.symbol}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <div className="relative">
              <select
                value={receiveIndex}
                onChange={(e) => setReceiveIndex(Number(e.target.value))}
                className="appearance-none rounded-xl bg-white/10 py-2 pl-9 pr-8 text-[14px] font-bold text-white outline-none"
              >
                {receiveAssets.map((a, i) => (
                  <option key={a.symbol} value={i} className="text-slate-900">
                    {a.symbol}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-sky-400 text-white">
                <ReceiveIcon size={13} />
              </div>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/70"
              />
            </div>
            <input
              type="text"
              value={receiveValue.toFixed(6)}
              readOnly
              className="w-32 bg-transparent text-right text-[26px] font-black text-white outline-none sm:w-40"
            />
          </div>
        </div>

        {/* Rate & Fee */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-indigo-100">Exchange Rate</span>
            <span className="font-bold text-white">{rateLabel}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-indigo-100">Network Settlement Fee</span>
            <span className="font-bold text-emerald-300">
              0.000000 {payAsset.symbol} (0% Fee)
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-300/40 bg-rose-500/15 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-200" />
            <p className="text-[12.5px] text-rose-50">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-200" />
            <p className="text-[12.5px] text-emerald-50">{success}</p>
          </div>
        )}

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[15px] font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Submitting…
            </>
          ) : (
            "Confirm Instant Swap"
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="dash-card mt-6 p-6">
        <h3 className="text-[18px] font-bold text-slate-900">Quick Actions</h3>
        <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                aria-current={action.active ? "page" : undefined}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition hover:scale-[1.03] ${
                  action.active
                    ? "border-2 border-indigo-200 bg-indigo-50/60"
                    : "border border-transparent bg-slate-50/60 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.bg}`}
                >
                  <Icon size={20} className={action.color} />
                </div>
                <span className="text-[12px] font-semibold text-slate-700">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfsiter-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
