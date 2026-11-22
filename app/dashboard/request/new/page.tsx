"use client";

import { useState } from "react";
import { UserPlus, ChevronDown, Send } from "lucide-react";

const currencies = [
  { label: "Tether USD (USDT)", symbol: "USDT" },
  { label: "Bitcoin (BTC)", symbol: "BTC" },
  { label: "Ethereum (ETH)", symbol: "ETH" },
  { label: "BNB (BNB)", symbol: "BNB" },
];

export default function RequestNewPage() {
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState(0);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-[520px]">
      <form onSubmit={handleSubmit} className="dash-card p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <UserPlus size={22} />
        </div>

        <h3 className="mt-4 text-[22px] font-bold text-slate-900">Request Funds</h3>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Send an invoice-like request to any user or client email.
        </p>

        {/* Payer Email */}
        <div className="mt-6">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Payer Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter payer's email address"
            className="dash-input w-full py-3.5 px-4 text-[14px]"
          />
        </div>

        {/* Currency + Amount */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Currency
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(Number(e.target.value))}
                className="dash-input w-full appearance-none py-3.5 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                {currencies.map((c, i) => (
                  <option key={c.symbol} value={i}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="dash-input w-full py-3.5 px-4 text-[14px]"
            />
          </div>
        </div>

        {/* Note / Purpose */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Note / Purpose (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What is this request for?"
            rows={4}
            className="dash-input w-full resize-y px-4 py-3 text-[14px]"
          />
        </div>

        <button
          type="submit"
          className="dash-submit mt-6 w-full rounded-xl py-3.5 text-[14px] font-bold"
        >
          <span className="inline-flex items-center gap-2">
            <Send size={16} /> Send Payment Request
          </span>
        </button>
      </form>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfsiter-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
