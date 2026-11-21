"use client";

import { useState } from "react";
import { FileText, ChevronDown, Send, Calendar } from "lucide-react";

const currencies = ["USDT", "BTC", "ETH", "BNB", "XLM"];

export default function CreateInvoicePage() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("2026-11-24");
  const [notes, setNotes] = useState("");

  return (
    <div className="mx-auto max-w-[620px]">
      <form className="dash-card p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
          <FileText size={22} className="text-indigo-600" />
        </div>

        <h3 className="mt-5 text-[22px] font-bold text-slate-900">Create Web3 Invoice</h3>
        <p className="mt-1 text-[12.5px] text-slate-500">
          Issue multi-currency invoices payable in crypto or fiat balance.
        </p>

        {/* Client Name + Email */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Client Full Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Doe"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Client Email
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>
        </div>

        {/* Currency + Amount + Due Date */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              Total Amount
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
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="dash-input w-full py-3 px-4 pr-10 text-[13.5px] text-slate-800"
              />
              <Calendar
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Line Items / Description */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Line Items / Description Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Description of services rendered or goods sold..."
            rows={4}
            className="dash-input w-full resize-y px-4 py-3 text-[13.5px]"
          />
        </div>

        <button
          type="submit"
          className="dash-submit mt-6 w-full rounded-xl py-3.5 text-[14px] font-bold"
        >
          <span className="inline-flex items-center gap-2">
            <Send size={16} /> Issue & Send Invoice
          </span>
        </button>
      </form>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfs Tier-4B. All rights reserved.
      </footer>
    </div>
  );
}
