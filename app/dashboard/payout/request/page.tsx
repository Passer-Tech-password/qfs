"use client";

import { useState } from "react";
import {
  DollarSign,
  Bitcoin,
  Rocket,
  Send,
  ChevronDown,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createPayout } from "@/lib/firebase/money";

const balances = [
  {
    icon: DollarSign,
    label: "USDT Balance",
    amount: "$0.00",
    pill: "USDT",
    card: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-500",
    pillBg: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Bitcoin,
    label: "BTC Balance",
    amount: "0.000000",
    pill: "BTC",
    card: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    pillBg: "bg-amber-100 text-amber-700",
  },
  {
    icon: Rocket,
    label: "XLM Balance",
    amount: "0.0000",
    pill: "XLM",
    card: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-500",
    pillBg: "bg-violet-100 text-violet-700",
  },
];

export default function RequestPayoutPage() {
  const [asset, setAsset] = useState("USDT - Available: $0.00");
  const [method, setMethod] = useState("Direct Crypto Blockchain Wallet");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const numeric = parseFloat(amount) || 0;
    if (!address.trim()) {
      setSuccess(null);
      setError("Enter a destination wallet address or IBAN.");
      return;
    }
    if (numeric <= 0) {
      setSuccess(null);
      setError("Enter a payout amount greater than zero.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await createPayout({
        asset: asset.split(" - ")[0].trim(),
        method,
        address: address.trim(),
        amount: numeric,
      });
      setSuccess(
        "Payout request submitted. It now appears in your payout history as pending review.",
      );
      setAddress("");
      setAmount("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not submit your payout request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[980px]">
      {/* Available Balances */}
      <section>
        <h2 className="text-[18px] font-bold text-slate-900">Available Balances</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {balances.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className={`rounded-2xl border p-5 ${b.card}`}>
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${b.iconBg}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${b.pillBg}`}>
                    {b.pill}
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-semibold text-slate-600">{b.label}</p>
                <p className="mt-1 text-[26px] font-black tracking-tight text-slate-900">
                  {b.amount}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Request Withdrawal / Payout Form */}
      <form onSubmit={handleSubmit} className="dash-card mt-6 p-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
          <Send size={20} className="text-indigo-600" />
        </div>

        <h3 className="mt-4 text-[20px] font-bold text-slate-900">
          Request Withdrawal / Payout
        </h3>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Withdraw your funds to an on-chain cryptocurrency wallet or bank wire.
        </p>

        <div className="mt-6 space-y-5">
          {/* Asset / Currency */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Select Asset / Currency
            </label>
            <div className="relative">
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                <option>USDT - Available: $0.00</option>
                <option>BTC - Available: 0.000000</option>
                <option>XLM - Available: 0.0000</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Payout Method */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Payout Method
            </label>
            <div className="relative">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                <option>Direct Crypto Blockchain Wallet</option>
                <option>Bank Wire Transfer (IBAN)</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Destination Address / IBAN */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Destination Address / IBAN
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter destination wallet address (0x... / bc1...) or IBAN"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>

          {/* Payout Amount */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Payout Amount
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <p className="text-[12.5px] text-rose-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="text-[12.5px] text-emerald-700">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="dash-submit mt-7 w-full rounded-2xl py-3.5 text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-2">
            {submitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" /> Submitting…
              </>
            ) : (
              "Submit Payout Request"
            )}
          </span>
        </button>
      </form>
    </div>
  );
}
