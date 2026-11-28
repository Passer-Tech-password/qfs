"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, Plus, ArrowUpRight, QrCode, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ConnectWalletModal } from "@/components/dashboard/connect-wallet-modal";
import { useDepositAddresses } from "@/lib/firebase/deposit-addresses";
import { useMarketData } from "@/lib/hooks/use-market-data";
import { useWalletBalances } from "@/lib/hooks/use-wallet-balances";

type MarketStatus = "loading" | "live" | "delayed" | "unavailable";

// Full-precision USD formatting for portfolio totals.
function formatPortfolioUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function MarketVelocity() {
  const { data, status } = useMarketData();
  const marketStatus: MarketStatus = status;
  const velocity = data?.velocity ?? [];

  const chart = useMemo(() => {
    const validVelocity = velocity.filter(
      (point) =>
        Number.isFinite(point.timestamp) &&
        Number.isFinite(point.percentPerHour),
    );
    if (validVelocity.length < 2) return null;

    const maxMagnitude = Math.max(
      ...validVelocity.map((point) => Math.abs(point.percentPerHour)),
      0.001,
    );
    const zeroY = 56;
    const toY = (value: number) =>
      zeroY - (value / maxMagnitude) * 38;
    const points = validVelocity.map((point, index) => {
      const x = (index / (validVelocity.length - 1)) * 400;
      return `${x.toFixed(2)},${toY(point.percentPerHour).toFixed(2)}`;
    });
    const line = `M ${points.join(" L ")}`;
    const area = `${line} L 400,${zeroY} L 0,${zeroY} Z`;
    const lastX = "400.00";
    const lastY = toY(validVelocity[validVelocity.length - 1].percentPerHour).toFixed(2);

    return {
      line,
      area,
      lastX,
      lastY,
      zeroY,
      currentVelocity: validVelocity[validVelocity.length - 1].percentPerHour,
    };
  }, [velocity]);

  const statusLabel = {
    loading: "CONNECTING",
    live: "LIVE 24H",
    delayed: "DELAYED",
    unavailable: "OFFLINE",
  }[marketStatus];

  const formatUsd = (value?: number) => {
    if (!Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value!);
  };

  return (
    <div className="flex min-h-[205px] flex-col rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-indigo-100">
          XLM Market Cap &amp; Velocity
        </p>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold sm:text-[10px] ${
            marketStatus === "live"
              ? "bg-emerald-500/20 text-emerald-200"
              : marketStatus === "delayed"
                ? "bg-amber-500/20 text-amber-200"
                : "bg-white/10 text-indigo-100"
          }`}
          aria-live="polite"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              marketStatus === "live"
                ? "animate-quantum-blink bg-emerald-300"
                : marketStatus === "delayed"
                  ? "bg-amber-300"
                  : "bg-slate-300"
            }`}
          />
          {statusLabel}
        </span>
      </div>
      <div className="mt-auto h-[92px] pt-2">
        {chart ? (
          <svg
            className="h-full w-full overflow-hidden"
            viewBox="0 0 400 112"
            preserveAspectRatio="none"
            role="img"
            aria-label={`24-hour XLM price velocity chart, current velocity ${chart.currentVelocity.toFixed(4)} percent per hour`}
          >
            <defs>
              <linearGradient id="market-area-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#31e6a3" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#31e6a3" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,${chart.zeroY} L 400,${chart.zeroY}`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.2"
              strokeDasharray="4 5"
            />
            <path d={chart.area} fill="url(#market-area-fill)" />
            <path
              d={chart.line}
              fill="none"
              stroke="#31e6a3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 0 3px #31e6a3)" }}
            />
            <circle
              cx={chart.lastX}
              cy={chart.lastY}
              r="4"
              fill="#fff"
              style={{ transition: "cy 600ms ease-out" }}
            />
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-indigo-100/75">
            {marketStatus === "unavailable"
              ? "Live market data is unavailable."
              : marketStatus === "loading"
                ? "Loading calculated market velocity…"
                : "Velocity history is unavailable."}
          </div>
        )}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/10 pt-2 text-[10px]">
        <div>
          <p className="text-indigo-100/70">Market cap</p>
          <p className="font-bold text-white">{formatUsd(data?.assets.XLM.marketCapUsd)}</p>
        </div>
        <div>
          <p className="text-indigo-100/70">24h volume</p>
          <p className="font-bold text-white">{formatUsd(data?.assets.XLM.volume24hUsd)}</p>
        </div>
        <div>
          <p className="text-indigo-100/70">Velocity / hour</p>
          <p className="font-bold text-white">
            {chart ? `${chart.currentVelocity >= 0 ? "+" : ""}${chart.currentVelocity.toFixed(4)}%` : "—"}
          </p>
        </div>
      </div>
      {data && (
        <p className="sr-only" aria-live="polite">
          Current XLM price: {formatUsd(data.assets.XLM.priceUsd)}. Market cap:{" "}
          {formatUsd(data.assets.XLM.marketCapUsd)}. Source: {data.source}.
        </p>
      )}
    </div>
  );
}

export function VaultHero() {
  const [walletOpen, setWalletOpen] = useState(false);
  const { addresses, loading: addressesLoading } = useDepositAddresses();
  const { totalUsd, hasUnpricedHolding, loading: walletLoading } =
    useWalletBalances();
  const portfolioTotal =
    walletLoading || hasUnpricedHolding ? "—" : formatPortfolioUsd(totalUsd);
  const paymentAddress = useMemo(
    () =>
      [...addresses].sort((a, b) => {
        const priority = (symbol: string) => {
          const normalized = symbol.toUpperCase();
          if (normalized === "XRP") return 0;
          if (normalized === "XLM") return 1;
          return 2;
        };
        return priority(a.symbol) - priority(b.symbol) || (a.order ?? 0) - (b.order ?? 0);
      })[0],
    [addresses],
  );
  const paymentQrValue = useMemo(() => {
    if (!paymentAddress) return "";
    const memo = paymentAddress.memo?.trim();
    if (paymentAddress.symbol.toUpperCase() === "XRP" && memo) {
      return `xrpl:${paymentAddress.address}?dt=${encodeURIComponent(memo)}`;
    }
    return paymentAddress.address;
  }, [paymentAddress]);

  function downloadPaymentQr() {
    const svg = document.querySelector<SVGSVGElement>("#overview-payment-qr svg");
    if (!svg || !paymentAddress) return;

    const source = new XMLSerializer().serializeToString(svg);
    const file = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qfs-${paymentAddress.symbol.toLowerCase()}-payment-qr.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="dash-hero relative overflow-hidden rounded-[24px] p-7 text-white">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide">
            <Sparkles size={12} /> QUANTUM ASSET VAULT
          </span>

          <p className="mt-4 text-[13px] text-indigo-100">Total Portfolio Value</p>
          <p className="mt-1 text-[32px] font-black leading-none tracking-tight sm:text-[38px] lg:text-[44px]">{portfolioTotal}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-indigo-100">
            <span className="font-semibold text-emerald-300">↗ 3.48%</span>
            <span aria-hidden="true" className="text-indigo-200/60">·</span>
            <span>Available Assets: <span className="font-semibold">{portfolioTotal}</span></span>
            <span aria-hidden="true" className="text-indigo-200/60">·</span>
            <span>APY: <span className="font-semibold text-emerald-300">+$0.00</span></span>
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              <Wallet size={15} /> Connect Wallet
            </button>
            <Link
              href="/dashboard/deposit/new"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/20"
            >
              <Plus size={15} /> Deposit
            </Link>
            <Link
              href="/dashboard/payout/request"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/20"
            >
              <ArrowUpRight size={15} /> Withdraw
            </Link>
            <Link
              href="/dashboard/qr-payment"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/20"
            >
              <QrCode size={15} /> QR Pay
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mt-7 grid grid-cols-1 items-center gap-5 lg:grid-cols-[1.28fr_1fr]">
        <MarketVelocity />

        <div className="flex min-h-[208px] flex-col items-center rounded-2xl bg-white px-4 py-4 text-slate-800 shadow-lg sm:px-5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-slate-900">
            Scan to Pay
          </p>
          {addressesLoading ? (
            <div className="mt-2 flex h-[124px] w-[124px] items-center justify-center rounded-[15px] border border-slate-100 bg-slate-50 text-center text-[10px] text-slate-500">
              Loading payment address…
            </div>
          ) : paymentAddress ? (
            <Link
              href="/dashboard/qr-payment"
              aria-label={`Open ${paymentAddress.symbol} QR payment`}
              className="mt-2 flex h-[124px] w-[124px] items-center justify-center rounded-[15px] border border-slate-100 bg-white p-1.5 transition hover:shadow-md focus-visible:outline-indigo-500"
            >
              <span id="overview-payment-qr">
                <QRCodeSVG
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  includeMargin
                  level="M"
                  size={110}
                  value={paymentQrValue}
                />
              </span>
            </Link>
          ) : (
            <Link
              href="/dashboard/qr-payment"
              className="mt-2 flex h-[124px] w-[124px] items-center justify-center rounded-[15px] border border-slate-100 bg-slate-50 p-3 text-center text-[10px] font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Payment QR unavailable. Open QR payment setup.
            </Link>
          )}
          <div className="mt-2 flex items-center justify-center">
            {paymentAddress && !addressesLoading && (
              <button
                type="button"
                onClick={downloadPaymentQr}
                aria-label="Download payment QR code"
                className="text-center text-[10px] text-slate-500 transition hover:text-indigo-600"
              >
                Click QR to open / download
              </button>
            )}
            {(!paymentAddress || addressesLoading) && (
              <Link href="/dashboard/qr-payment" className="text-center text-[10px] text-slate-500 hover:text-indigo-600">
                {addressesLoading ? "Loading QR code…" : "Open QR payment"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </section>
  );
}
