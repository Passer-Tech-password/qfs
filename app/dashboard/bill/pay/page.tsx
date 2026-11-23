"use client";

import { useState } from "react";
import { Receipt, ChevronDown, Zap, CheckCircle2, AlertCircle } from "lucide-react";

const billCategories = [
  "Electricity & Power",
  "Water & Utilities",
  "Internet & Broadband",
  "Telecom / Mobile",
  "Cable TV & Streaming",
  "Gas & Heating",
  "Subscription & Membership",
];

const currencies = ["USDT", "BTC", "XLM", "XRP"];

export default function PayBillPage() {
  const [category, setCategory] = useState(billCategories[0]);
  const [biller, setBiller] = useState("");
  const [account, setAccount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    if (!biller.trim()) {
      setError("Please enter the biller or provider name.");
      return;
    }
    if (!account.trim()) {
      setError("Please enter the account, meter, or customer reference.");
      return;
    }
    const amt = parseFloat(amount);
    if (!amount.trim() || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid bill amount greater than zero.");
      return;
    }
    setError(null);
    setSuccess(true);
  }

  return (
    <div className="mx-auto max-w-[620px]">
      <form onSubmit={handleSubmit} className="dash-card p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
          <Receipt size={22} className="text-indigo-600" />
        </div>

        <h3 className="mt-5 text-[22px] font-bold text-slate-900">Pay Utility & Bills</h3>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Pay electricity, telecom, water, internet, and subscriptions directly using your wallet
          balance.
        </p>

        {/* Bill Category */}
        <div className="mt-7">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Bill Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
            >
              {billCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Biller / Provider Name */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Biller / Provider Name
          </label>
          <input
            type="text"
            value={biller}
            onChange={(e) => setBiller(e.target.value)}
            placeholder="e.g. ConEdison, AT&T, Vodafone"
            className="dash-input w-full py-3 px-4 text-[13.5px]"
          />
        </div>

        {/* Account / Meter / Customer Reference */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Account / Meter / Customer Reference
          </label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="Enter customer meter / account number"
            className="dash-input w-full py-3 px-4 text-[13.5px]"
          />
        </div>

        {/* Currency + Bill Amount */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Bill Amount
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="dash-submit mt-6 w-full rounded-xl py-3.5 text-[14px] font-bold"
        >
          <span className="inline-flex items-center gap-2">
            <Zap size={16} /> Authorize Bill Payment
          </span>
        </button>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <p className="text-[12.5px] font-medium text-rose-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-[12.5px] font-medium text-emerald-700">
              Your bill payment of {amount} {currency} to {biller} has been authorized successfully.
            </p>
          </div>
        )}
      </form>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfstier-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
