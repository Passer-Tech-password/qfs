"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useDepositAddresses } from "@/lib/firebase/deposit-addresses";
import { useWalletBalances } from "@/lib/hooks/use-wallet-balances";
import {
  postWalletAction,
  type WalletActionResult,
} from "@/lib/firebase/wallet-api";
import {
  WALLET_CURRENCIES,
  formatWalletAmount,
  type WalletCurrency,
} from "@/lib/server/wallet-currency";

const payCurrencies = [
  { label: "XRP (Ripple)", symbol: "XRP" },
  { label: "XLM (Stellar)", symbol: "XLM" },
  { label: "USDT (Tether USD)", symbol: "USDT" },
  { label: "BTC (Bitcoin)", symbol: "BTC" },
];

export default function QrPaymentPage() {
  const router = useRouter();
  const { addresses, loading: addressesLoading, error: addressesError } = useDepositAddresses();
  const { assets: walletAssets } = useWalletBalances();
  const walletCurrencies = [...addresses].sort((a, b) => {
    const priority = (symbol: string) => {
      const normalized = symbol.toUpperCase();
      if (normalized === "XRP") return 0;
      if (normalized === "XLM") return 1;
      return 2;
    };
    return priority(a.symbol) - priority(b.symbol) || (a.order ?? 0) - (b.order ?? 0);
  });
  const [walletIndex, setWalletIndex] = useState(0);
  const [merchant, setMerchant] = useState("");
  const [qrString, setQrString] = useState("");
  const [payCurrency, setPayCurrency] = useState(0);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const wallet = walletCurrencies[walletIndex];
  const pay = payCurrencies[payCurrency];

  const paySymbol = pay.symbol as WalletCurrency;
  const payAsset = walletAssets.find((a) => a.currency === paySymbol);
  const payAvailableUnits = payAsset?.units ?? 0;
  const payAvailable = formatWalletAmount(payAvailableUnits, paySymbol);
  const payAvailableHuman =
    payAvailableUnits / 10 ** WALLET_CURRENCIES[paySymbol].decimals;
  const payPrice = payAsset?.priceUsd ?? null;
  const amountNumeric = parseFloat(amount) || 0;
  const amountUsd =
    payPrice !== null && Number.isFinite(payPrice) ? amountNumeric * payPrice : null;

  function handleCopy() {
    if (!wallet) return;
    navigator.clipboard?.writeText(wallet.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handlePaste() {
    navigator.clipboard?.readText().then((text) => setQrString(text)).catch(() => {});
  }

  function handleSaveQr() {
    if (!wallet) return;
    const svg = document.querySelector<SVGSVGElement>("[data-qr-svg]");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${wallet.symbol}-${wallet.address.slice(0, 8)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleConfirmPayment() {
    if (submitting) return;
    if (!merchant.trim()) {
      setPaySuccess(null);
      setPayError("Enter the merchant name or recipient ID.");
      return;
    }
    const amountStr = amount.trim();
    const decimals = WALLET_CURRENCIES[paySymbol].decimals;

    if (amountNumeric <= 0) {
      setPaySuccess(null);
      setPayError("Enter a payment amount greater than zero.");
      return;
    }
    if (
      !/^\d+(\.\d+)?$/.test(amountStr) ||
      (amountStr.split(".")[1] ?? "").length > decimals
    ) {
      setPaySuccess(null);
      setPayError(`Enter a valid ${paySymbol} amount (up to ${decimals} decimal places).`);
      return;
    }
    if (amountNumeric - payAvailableHuman > 1e-9) {
      setPaySuccess(null);
      setPayError(
        `Insufficient ${paySymbol} balance. Available: ${payAvailable} ${paySymbol}.`,
      );
      return;
    }

    setPayError(null);
    setPaySuccess(null);
    setSubmitting(true);
    try {
      idempotencyKeyRef.current ??= crypto.randomUUID();
      const result = await postWalletAction<WalletActionResult>(
        "/api/wallet/qr-payment",
        {
          currency: paySymbol,
          merchant: merchant.trim(),
          qrString: qrString.trim(),
          amount: amountStr,
          idempotencyKey: idempotencyKeyRef.current,
        },
      );
      idempotencyKeyRef.current = null;
      setPaySuccess(result.message);
      setMerchant("");
      setQrString("");
      setAmount("");
    } catch (caught) {
      setPayError(
        caught instanceof Error
          ? caught.message
          : "The payment could not be completed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
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
                disabled={addressesLoading || walletCurrencies.length === 0}
                className="dash-input w-full appearance-none py-3 pl-4 pr-10 text-[13.5px] font-medium text-slate-800"
              >
                {walletCurrencies.map((c, i) => (
                  <option key={c.id} value={i}>
                    {c.asset} ({c.symbol}) - {c.network}
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
            {wallet ? (
              <>
                <div className="flex h-[180px] w-[180px] items-center justify-center rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <QRCodeSVG
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                    size={156}
                    value={wallet.address}
                    data-qr-svg=""
                  />
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Network: {wallet.network} ({wallet.symbol})
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Click below to download or copy address
                </p>
              </>
            ) : (
              <p className="py-10 text-center text-[12px] text-slate-500">
                {addressesLoading
                  ? "Loading wallet addresses..."
                  : addressesError ?? "No wallet addresses are currently available."}
              </p>
            )}
          </div>

          {/* Wallet Address */}
          <div className="mt-5">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Assigned Wallet Address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <span className="flex-1 truncate text-[12.5px] font-medium text-slate-700">
                {wallet?.address ?? "Wallet address unavailable"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!wallet}
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
              onClick={handleSaveQr}
              disabled={!wallet}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-3 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={15} /> Save QR
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/deposit/new")}
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
            <button
              type="button"
              onClick={() => router.push("/dashboard/qr-payments")}
              className="text-[12.5px] font-bold text-indigo-600 hover:text-indigo-700"
            >
              Payment History →
            </button>
          </div>

          {/* Balance Card */}
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-indigo-50/60 px-5 py-4">
            <div>
              <p className="text-[12px] font-semibold text-indigo-600">Available Wallet Balance</p>
              <p className="mt-1 text-[26px] font-black text-slate-900">
                {payAvailable}{" "}
                <span className="text-[14px] font-bold text-slate-500">{paySymbol}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/deposit/new")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-indigo-700"
            >
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

          {amountUsd !== null && amountNumeric > 0 && (
            <p className="mt-2 text-[11.5px] text-slate-400">
              ≈ ${amountUsd.toFixed(2)} USD at current market rate
            </p>
          )}

          {payError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
              <p className="text-[12.5px] font-medium text-rose-700">{payError}</p>
            </div>
          )}

          {paySuccess && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-[12.5px] font-medium text-emerald-700">{paySuccess}</p>
            </div>
          )}

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={submitting}
            className="dash-submit mt-6 w-full rounded-xl py-3.5 text-[14px] font-bold disabled:opacity-70"
          >
            <span className="inline-flex items-center gap-2">
              {submitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" /> Authorizing…
                </>
              ) : (
                <>
                  <Lock size={16} /> Confirm & Authorize QR Payment
                </>
              )}
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
        © 2026 Qfstier-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
