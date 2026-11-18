"use client";

import { useState } from "react";
import { Flag, ChevronDown, ShieldCheck } from "lucide-react";

export default function DisputePage() {
  const [ref, setRef] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [details, setDetails] = useState("");

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
        {/* File a Dispute */}
        <div className="dash-card p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
            <Flag size={22} className="text-orange-500" />
          </div>

          <h3 className="mt-4 text-[20px] font-bold text-slate-900">File a Dispute</h3>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Open an official claim for disputed transactions, trades, or unfulfilled deliverables.
          </p>

          {/* Transaction Ref */}
          <div className="mt-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Transaction Ref / Order ID
            </label>
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. TX-XXXX or DEP-XXXX"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>

          {/* Subject */}
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Dispute Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief title of the issue"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>

          {/* Priority */}
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Priority
            </label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Details */}
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Details & Evidence
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain in detail what happened and why you are filing a dispute..."
              rows={6}
              className="dash-input w-full resize-y px-4 py-3 text-[13.5px]"
            />
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105"
          >
            Submit Dispute Claim
          </button>
        </div>

        {/* Dispute History */}
        <div className="dash-card p-6">
          <h3 className="text-[20px] font-bold text-slate-900">Dispute History</h3>

          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ShieldCheck size={26} className="text-slate-400" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-slate-700">No Open Disputes</p>
            <p className="mt-1.5 max-w-[360px] text-[12.5px] text-slate-500">
              All your transactions are clear. If you ever experience issues with a transfer or
              trade, file a claim here.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Quantum Finance. All rights reserved.
      </footer>
    </div>
  );
}
