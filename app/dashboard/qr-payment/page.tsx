"use client";

import { useState } from "react";
import {
  QrCode,
  ChevronDown,
  Copy,
  Check,
  Download,
  Plus,
  ShieldCheck,
  Lock,
  Zap,
} from "lucide-react";

const walletCurrencies = [
  {
    label: "Tether USD (USDT) - TRC20",
    network: "TRC20",
    unit: "USDT",
    address: "TSwpncZejzMKU7VTyqZz8RT676henUsTnY",
  },
  {
    label: "Bitcoin (BTC) - Bitcoin",
    network: "BTC",
    unit: "BTC",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
];

const payCurrencies = [
  { label: "USDT (Tether USD)", symbol: "USDT" },
  { label: "BTC (Bitcoin)", symbol: "BTC" },
  { label: "ETH (Ethereum)", symbol: "ETH" },
];

export default function QrPaymentPage() {
  const [walletIndex, setWalletIndex] = useState(0);
  const [merchant, setMerchant] = useState("");
  const [qrString, setQrString] = useState("");
  const [payCurrency, setPayCurrency] = useState(0);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const wallet = walletCurrencies[walletIndex];
  const pay = payCurrencies[payCurrency];

  function handleCopy() {
    navigator.clipboard?.writeText(wallet.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handlePaste() {
    navigator.clipboard?.readText().then((text) => setQrString(text)).catch(() => {});
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[460px_1fr]">
        {/* Receive & Scan to Pay */}
        <div className="dash-card p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100">
            <QrCode size={22} className="text-indigo-600" />
          </div>

          <h3 className="mt-4 text-[20px] font-bold text-slate-900">Receive & Scan to Pay</h3>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Select currency to reveal the designated QR code & wallet address.
          </p>

          {/* Currency Selector */}
          <div className="mt-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Payment / Wallet Currency
            </label>
            <div className="relative">
              <select
                value={walletIndex}
                onChange={(e) => setWalletIndex(Number(e.target.value))}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                {walletCurrencies.map((c, i) => (
                  <option key={c.network} value={i}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex flex-col items-center rounded-2xl bg-slate-50 p-6">
            <div className="flex h-[180px] w-[180px] items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
              <QrCode size={140} className="text-slate-900" strokeWidth={1.2} />
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Network: {wallet.network} ({wallet.unit})
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Click below to download or copy address
            </p>
          </div>

          {/* Wallet Address */}
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Assigned Wallet Address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <span className="flex-1 truncate text-[12.5px] font-medium text-slate-700">
                {wallet.address}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-3 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Download size={15} /> Save QR
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-3 text-[13px] font-bold text-indigo-600 transition hover:bg-indigo-100"
            >
              <Plus size={15} /> Deposit Now
            </button>
          </div>
        </div>

        {/* Authorize QR Payment */}
        <div className="dash-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[20px] font-bold text-slate-900">Authorize QR Payment</h3>
              <p className="mt-1 text-[12.5px] text-slate-500">
                Instantly pay merchant POS invoices or transfer to another wallet.
              </p>
            </div>
            <button className="text-[12.5px] font-bold text-indigo-600 hover:text-indigo-700">
              Payment History →
            </button>
          </div>

          {/* Balance Card */}
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-50/60 px-5 py-4">
            <div>
              <p className="text-[12px] font-semibold text-indigo-600">Available Wallet Balance</p>
              <p className="mt-1 text-[26px] font-black text-slate-900">
                0.00 <span className="text-[14px] font-bold text-slate-500">USDT</span>
              </p>
            </div>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-indigo-700">
              Top Up
            </button>
          </div>

          {/* Merchant Name */}
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Merchant Name / Recipient ID *
            </label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Starlink Checkout, POS Merchant #9042, User ID"
              className="dash-input w-full py-3 px-4 text-[13.5px]"
            />
          </div>

          {/* Scanned QR */}
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Scanned QR Code Raw String / Invoice ID (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={qrString}
                onChange={(e) => setQrString(e.target.value)}
                placeholder="Paste scanned QR raw payload or token address"
                className="dash-input flex-1 py-3 px-4 text-[13.5px]"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="shrink-0 rounded-lg border border-slate-200 px-4 py-3 text-[12.5px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Paste
              </button>
            </div>
          </div>

          {/* Currency + Amount */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Payment Currency
              </label>
              <div className="relative">
                <select
                  value={payCurrency}
                  onChange={(e) => setPayCurrency(Number(e.target.value))}
                  className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
                >
                  {payCurrencies.map((c, i) => (
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
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Amount to Pay *
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="dash-input w-full py-3 px-4 text-[13.5px]"
              />
            </div>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            className="dash-submit mt-6 w-full rounded-xl py-3.5 text-[14px] font-bold"
          >
            <span className="inline-flex items-center gap-2">
              <Lock size={16} /> Confirm & Authorize QR Payment
            </span>
          </button>

          {/* Footer badges */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600">
              <ShieldCheck size={13} /> Instant 256-bit Settlement
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500">
              <Zap size={13} /> Zero Gas Fee on Internal QR
            </span>
          </div>
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Quantum Finance. All rights reserved.
      </footer>
    </div>
  );
}
