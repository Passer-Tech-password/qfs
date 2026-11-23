"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Send,
  Copy,
  Check,
  Info,
  Paperclip,
  ChevronDown,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createDeposit } from "@/lib/firebase/money";
import { useDepositAddresses } from "@/lib/firebase/deposit-addresses";

/**
 * Currencies the platform supports for deposits. The Deposit Funds dropdown
 * always lists every supported currency; each one is mapped to its enabled
 * receiving address from the `deposit_addresses` Firestore collection when one
 * is configured.
 */
const SUPPORTED_CURRENCIES = [
  { asset: "Tether", symbol: "USDT" },
  { asset: "Bitcoin", symbol: "BTC" },
  { asset: "Stellar", symbol: "XLM" },
  { asset: "Ripple", symbol: "XRP" },
] as const;

export function DepositForm({
  selectedSymbol,
  selectionVersion,
}: {
  selectedSymbol: string | null;
  selectionVersion: number;
}) {
  const { addresses, loading, error: loadError } = useDepositAddresses();
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [usdAmount, setUsdAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // Merge every enabled Firestore receiving address with any supported
  // currencies that do not yet have a configured address, so the dropdown
  // always lists the full supported set.
  const currencyItems = useMemo(() => {
    const configured = addresses.map((address) => ({
      asset: address.asset,
      symbol: address.symbol,
      network: address.network,
      address,
      available: true,
    }));
    const configuredSymbols = new Set(
      addresses.map((a) => a.symbol.toUpperCase()),
    );
    const missing = SUPPORTED_CURRENCIES.filter(
      (c) => !configuredSymbols.has(c.symbol.toUpperCase()),
    ).map((c) => ({
      asset: c.asset,
      symbol: c.symbol,
      network: "Receiving address not configured",
      address: null,
      available: false,
    }));
    return [...configured, ...missing];
  }, [addresses]);

  const selectedItem =
    currencyItems.length > 0
      ? currencyItems[Math.min(currencyIndex, currencyItems.length - 1)]
      : null;
  const currency = selectedItem?.address ?? null;

  // Value encoded into the deposit QR. XRP deposits require a destination tag,
  // so the memo is appended using the standard xrpl URI format.
  const qrValue = useMemo(() => {
    if (!currency) return "";
    const memo = currency.memo?.trim();
    if (currency.symbol.toUpperCase() === "XRP" && memo) {
      return `xrpl:${currency.address}?dt=${encodeURIComponent(memo)}`;
    }
    return currency.address;
  }, [currency]);

  useEffect(() => {
    if (!selectedSymbol || loading) return;

    const selectedIndex = currencyItems.findIndex(
      (item) => item.symbol.toUpperCase() === selectedSymbol.toUpperCase(),
    );
    if (selectedIndex < 0) {
      setSelectionError(
        `No active receiving address is configured for ${selectedSymbol}. Choose a configured currency below.`,
      );
      setError(null);
      return;
    }

    setCurrencyIndex(selectedIndex);
    setSelectionError(null);
    setError(null);
    setSuccess(null);
  }, [currencyItems, loading, selectedSymbol, selectionVersion]);

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
    if (!currency) return;
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

    if (selectionError) {
      setSuccess(null);
      setError(selectionError);
      return;
    }

    if (!currency) {
      setSuccess(null);
      setError("No receiving address is available yet. Please try again later.");
      return;
    }

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
        asset: currency.asset,
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
    <form
      id="deposit-funds"
      onSubmit={handleSubmit}
      className="dash-card mt-6 scroll-mt-24 p-7"
    >
      <h3 className="text-[19px] font-bold text-slate-900">Deposit Funds</h3>
      <p className="mt-1 text-[12.5px] text-slate-500">
        Select currency, scan the QR or copy the address, then enter payment details below.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-10 text-[13px] text-slate-500">
          <LoaderCircle size={18} className="animate-spin" /> Loading receiving addresses…
        </div>
      ) : !currency ? (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[12.5px] text-amber-800">
            {loadError
              ? `Receiving addresses could not be loaded: ${loadError}`
              : selectedItem
                ? `The receiving address for ${selectedItem.symbol} is being configured. Please select another supported currency or check back shortly.`
                : "Receiving addresses are not configured yet. Please check back shortly or contact support."}
          </p>
        </div>
      ) : (
        <>
          {/* Select Currency */}
          <div className="mt-6">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Select Currency
            </label>
            <div className="relative">
              <select
                value={currencyItems.length > 0 ? Math.min(currencyIndex, currencyItems.length - 1) : 0}
                onChange={(e) => {
                  setCurrencyIndex(Number(e.target.value));
                  setSelectionError(null);
                  setError(null);
                }}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                {currencyItems.map((item, i) => (
                  <option key={`${item.symbol}-${i}`} value={i} disabled={!item.available}>
                    {item.asset} ({item.symbol}) — {item.network}
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
            <div className="flex h-[150px] w-[150px] items-center justify-center rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <QRCodeSVG
                bgColor="#ffffff"
                fgColor="#0f172a"
                includeMargin
                level="M"
                size={120}
                value={qrValue}
              />
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
            {currency.memo && (
              <p className="mt-2 text-[11.5px] text-slate-500">Memo / Tag: {currency.memo}</p>
            )}
          </div>

          {/* Amount & Conversion */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-slate-800">Deposit Amount & Conversion</h4>
              {currency.rateLabel && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600">
                  {currency.rateLabel}
                </span>
              )}
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
                  Crypto to Transfer ({currency.symbol})
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
                    {currency.symbol}
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
        </>
      )}

      {selectionError && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[12.5px] text-amber-800">{selectionError}</p>
        </div>
      )}

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
        disabled={submitting || !currency || Boolean(selectionError)}
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
