"use client";

import { useState } from "react";
import { Handshake, ChevronDown, Lock } from "lucide-react";

const currencies = [
  { label: "BNB (BNB)", symbol: "BNB", balance: "0.0000" },
  { label: "Tether USD (USDT)", symbol: "USDT", balance: "0.00" },
  { label: "Bitcoin (BTC)", symbol: "BTC", balance: "0.000000" },
];

export default function CreateEscrowPage() {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState(0);
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState("");

  const currencyInfo = currencies[currency];
  const numeric = parseFloat(amount) || 0;
  const fee = numeric * 0.01;
  const total = numeric + fee;

  return (
    <div className="mx-auto max-w-[560px]">
      <form className="dash-card p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Handshake size={20} />
          </div>
          <div>
            <h3 className="text-[19px] font-bold text-slate-900">
              Create Safe Escrow Contract
            </h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Funds are locked securely in smart vault until buyer & seller confirm milestones.
            </p>
          </div>
        </div>

        {/* Deal Title */}
        <div className="mt-6">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Deal / Contract Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Domain purchase, Graphic design project, OTC Trade"
            className="dash-input w-full py-3 px-4 text-[13.5px]"
          />
        </div>

        {/* Counterparty Email */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Counterparty (Buyer / Seller) Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@example.com"
            className="dash-input w-full py-3 px-4 text-[13.5px]"
          />
        </div>

        {/* Currency + Amount */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Currency
            </label>
            <span className="text-[11.5px] font-semibold text-indigo-600">
              Bal: {currencyInfo.balance} {currencyInfo.symbol}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(Number(e.target.value))}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
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
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>
        </div>

        {/* Terms */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Detailed Terms & Deliverables
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Describe the conditions under which funds should be released..."
            rows={5}
            className="dash-input w-full resize-y px-4 py-3 text-[13.5px]"
          />
        </div>

        {/* Fee Summary */}
        <div className="mt-5 rounded-2xl bg-indigo-50/60 p-5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Escrow Deal Amount:</span>
            <span className="font-bold text-slate-900">
              {numeric.toFixed(4)} {currencyInfo.symbol}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Platform Mediation Fee (1%):</span>
            <span className="font-bold text-slate-900">
              {fee.toFixed(4)} {currencyInfo.symbol}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-indigo-100 pt-3 text-[14px]">
            <span className="font-bold text-slate-900">Total Vault Deposit Required:</span>
            <span className="font-black text-indigo-600">
              {total.toFixed(4)} {currencyInfo.symbol}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="dash-submit mt-6 w-full rounded-xl py-3.5 text-[14px] font-bold"
        >
          <span className="inline-flex items-center gap-2">
            <Lock size={16} /> Lock Funds & Initialize Escrow Contract
          </span>
        </button>
      </form>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Quantum Finance. All rights reserved.
      </footer>
    </div>
  );
}
