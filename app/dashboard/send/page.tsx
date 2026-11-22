"use client";

import { useState } from "react";
import {
  Send,
  Zap,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createTransfer } from "@/lib/firebase/money";

const assets = [
  { label: "BNB (BNB) — Bal: 0.0000 BNB (~$0.00 USD)", symbol: "BNB", price: 580, balanceUsd: 0, network: "BNB Smart Chain (BEP20)" },
  { label: "Tether USD (USDT) — Bal: 0.00 USDT (~$0.00 USD)", symbol: "USDT", price: 1, balanceUsd: 0, network: "Tron (TRC20)" },
  { label: "Bitcoin (BTC) — Bal: 0.000000 BTC (~$0.00 USD)", symbol: "BTC", price: 0, balanceUsd: 0, network: "Bitcoin Network" },
];

export default function SendMoneyPage() {
  const [assetIndex, setAssetIndex] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const asset = assets[assetIndex];
  const amount = parseFloat(usdAmount) || 0;
  const equivalentCoin = asset.price > 0 ? (amount / asset.price).toFixed(4) : "0.0000";

  function handleMax() {
    setUsdAmount(asset.balanceUsd.toFixed(2));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!recipient.trim()) {
      setSuccess(null);
      setError("Enter a recipient username, email or wallet address.");
      return;
    }
    if (amount <= 0) {
      setSuccess(null);
      setError("Enter a transfer amount greater than zero.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await createTransfer({
        asset: asset.label,
        symbol: asset.symbol,
        network: asset.network,
        recipient: recipient.trim(),
        usdAmount: amount,
        coinAmount: parseFloat(equivalentCoin) || 0,
      });
      setSuccess(
        "Transfer request submitted. It now appears in your transfer records as pending review.",
      );
      setRecipient("");
      setUsdAmount("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not submit your transfer. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[680px]">
      {/* Zero-fee banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Zap size={18} />
        </div>
        <div>
          <p className="text-[12.5px] font-bold uppercase tracking-wide text-indigo-700">
            Zero-fee Quantum Settlement
          </p>
          <p className="mt-0.5 text-[12px] text-indigo-600/80">
            Transfers between QFS registered users are free & instant. Simply enter their email or
            username.
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-[12.5px] leading-relaxed text-amber-800">
          <span className="font-bold">Verify Address & Network Carefully:</span> Sending funds to
          the wrong address or selecting an incompatible blockchain network may result in
          permanent, irreversible loss of your assets. Always double check before confirming.
        </p>
      </div>

      {/* Transfer form */}
      <form onSubmit={handleSubmit} className="dash-card mt-5 p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Send size={20} />
          </div>
          <div>
            <h3 className="text-[19px] font-bold text-slate-900">Transfer & Send Funds</h3>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Send crypto instantly to any QFS user or external blockchain wallet address.
            </p>
          </div>
        </div>

        {/* Select Asset */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Select Asset
            </label>
            <span className="text-[11.5px] font-semibold text-indigo-600">
              Bal: 0.0000 BNB (~$0.00)
            </span>
          </div>
          <div className="relative">
            <select
              value={assetIndex}
              onChange={(e) => setAssetIndex(Number(e.target.value))}
              className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
            >
              {assets.map((a, i) => (
                <option key={a.symbol} value={i}>
                  {a.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Recipient */}
        <div className="mt-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Recipient
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter username, email (Free & Instant) or wallet address"
            className="dash-input w-full py-3 px-4 text-[13.5px]"
          />
          <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-indigo-600">
            <ShieldCheck size={13} /> Transfers between QFS registered users are free & instant.
          </p>
        </div>

        {/* Amount + Network */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Transfer Amount (USD)
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                1 {asset.symbol} = ${asset.price.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                placeholder="0.00"
                className="dash-input w-full py-3 pl-7 pr-16 text-[14px]"
              />
              <button
                type="button"
                onClick={handleMax}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600 transition hover:bg-indigo-100"
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Settlement Network{" "}
              <span className="text-emerald-500">(auto-detected)</span>
            </label>
            <div className="relative">
              <select
                disabled
                key={asset.network}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-500"
                defaultValue={asset.network}
              >
                <option>{asset.network}</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Equivalent coin */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-indigo-50/60 px-4 py-3">
          <span className="text-[12px] font-medium text-slate-600">Equivalent Coin:</span>
          <span className="text-[14px] font-bold text-indigo-600">
            ≈ {equivalentCoin} {asset.symbol}
          </span>
        </div>

        {/* Speed + Fee */}
        <div className="mt-4 space-y-2 rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-slate-500">Est. Processing Speed</span>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-600">
              <Zap size={13} /> 1 – 5 min (Blockchain Broadcast)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-slate-500">Network Fee</span>
            <span className="text-[12.5px] font-semibold text-slate-800">
              $0.00 <span className="text-slate-400">(Subsidized)</span>
            </span>
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
          className="dash-submit mt-6 w-full rounded-xl py-3.5 text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-2">
            {submitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send size={16} /> Review & Send Funds
              </>
            )}
          </span>
        </button>
      </form>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfsiter-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
