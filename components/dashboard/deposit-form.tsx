"use client";

import { useState } from "react";
import {
  Send,
  Copy,
  Check,
  Info,
  Paperclip,
  QrCode,
  ChevronDown,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createDeposit } from "@/lib/firebase/money";

const currencies = [
  { label: "Tether USD (USDT)", symbol: "USDT", network: "TRC20", address: "TSwpncZejzNKU7VTyqZz8RT676henUsTnY", rate: "1 USDT = $1.00 USD" },
  { label: "Bitcoin (BTC)", symbol: "BTC", network: "BTC", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", rate: "1 BTC = $0.00 USD" },
  { label: "Ethereum (ETH)", symbol: "ETH", network: "ERC20", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0", rate: "1 ETH = $0.00 USD" },
];

export function DepositForm() {
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [usdAmount, setUsdAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currency = currencies[currencyIndex];

  function handleUsdChange(value: string) {
    setUsdAmount(value);
    const num = parseFloat(value) || 0;
    setCryptoAmount(num.toFixed(2));
  }

  function handleCryptoChange(value: string) {
    setCryptoAmount(value);
    const num = parseFloat(value) || 0;
    setUsdAmount(num.toFixed(2));
  }

  function handleCopy() {
    navigator.clipboard?.writeText(currency.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const numericUsd = parseFloat(usdAmount) || 0;
    const numericCrypto = parseFloat(cryptoAmount) || 0;
    if (numericUsd <= 0 || numericCrypto <= 0) {
      setSuccess(null);
      setError("Enter a deposit amount greater than zero.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await createDeposit({
        asset: currency.label,
        symbol: currency.symbol,
        network: currency.network,
        address: currency.address,
        usdAmount: numericUsd,
        cryptoAmount: numericCrypto,
        txHash: txHash.trim(),
        fileName,
      });
      setSuccess(
        "Deposit request submitted. It now appears in your deposit history as pending review.",
      );
      setUsdAmount("");
      setCryptoAmount("");
      setTxHash("");
      setFileName(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not submit your deposit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card mt-6 p-7">
      <h3 className="text-[19px] font-bold text-slate-900">Deposit Funds</h3>
      <p className="mt-1 text-[12.5px] text-slate-500">
        Select currency, scan the QR or copy the address, then enter payment details below.
      </p>

      {/* Select Currency */}
      <div className="mt-6">
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
          Select Currency
        </label>
        <div className="relative">
          <select
            value={currencyIndex}
            onChange={(e) => setCurrencyIndex(Number(e.target.value))}
            className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
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
      </div>

      {/* QR + Address */}
      <div className="mt-5 flex flex-col items-center rounded-2xl bg-slate-50 p-6">
        <div className="flex h-[150px] w-[150px] items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
          <QrCode size={120} className="text-slate-900" strokeWidth={1.2} />
        </div>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Network: {currency.network}
        </p>
        <div className="mt-2 flex w-full max-w-[420px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
          <span className="flex-1 truncate text-[12.5px] font-medium text-slate-700">
            {currency.address}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy wallet address"
            className="text-slate-400 transition hover:text-indigo-600"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Amount & Conversion */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-slate-800">Deposit Amount & Conversion</h4>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600">
            {currency.rate}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11.5px] font-medium text-slate-500">
              Amount in USD ($)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={usdAmount}
                onChange={(e) => handleUsdChange(e.target.value)}
                placeholder="e.g. 50.00"
                className="dash-input w-full py-3 pl-7 pr-4 text-[14px]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] font-medium text-slate-500">
              Crypto to Transfer (USDT)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={cryptoAmount}
                onChange={(e) => handleCryptoChange(e.target.value)}
                placeholder="0.00"
                className="dash-input w-full py-3 pl-4 pr-16 text-[14px]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                USDT
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-50/60 px-3.5 py-2.5">
          <Info size={15} className="mt-0.5 shrink-0 text-indigo-500" />
          <p className="text-[11.5px] text-indigo-700/80">
            Enter either USD value or Crypto units. The exact equivalent will calculate
            automatically.
          </p>
        </div>
      </div>

      {/* Tx Hash + Screenshot */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Transaction Hash / Ref (Optional)
          </label>
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x... or TXID"
            className="dash-input w-full py-3 px-4 text-[13.5px]"
          />
          <p className="mt-1.5 text-[11px] text-slate-400">
            Paste blockchain hash or transfer identifier
          </p>
        </div>
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Upload Payment Screenshot (Optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-50 px-3.5 py-2.5 text-[12.5px] font-semibold text-indigo-700 transition hover:bg-indigo-100">
              <Paperclip size={14} />
              Choose File
              <input type="file" className="hidden" onChange={handleFile} />
            </label>
            <span className="text-[12px] text-slate-400">
              {fileName ?? "No file chosen"}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Attach transfer receipt for instant verification
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="text-[12.5px] text-rose-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          <p className="text-[12.5px] text-emerald-700">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="dash-submit mt-7 w-full rounded-xl py-3.5 text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="inline-flex items-center gap-2">
          {submitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Submitting…
            </>
          ) : (
            <>
              <Send size={16} /> Submit Deposit
            </>
          )}
        </span>
      </button>
    </form>
  );
}
