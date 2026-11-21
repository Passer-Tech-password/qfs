"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, Plus, ArrowUpRight, QrCode, Sparkles, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ConnectWalletModal } from "@/components/dashboard/connect-wallet-modal";
import { useDepositAddresses } from "@/lib/firebase/deposit-addresses";

type MarketStatus = "loading" | "live" | "delayed" | "unavailable";

function MarketVelocity() {
  const [prices, setPrices] = useState<number[]>([]);
  const [spotPrice, setSpotPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<MarketStatus>("loading");

  useEffect(() => {
    let active = true;
    let hasHistory = false;
    const controller = new AbortController();

    async function loadHistory(): Promise<boolean> {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/klines?symbol=XLMUSDT&interval=1h&limit=24",
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Market history is unavailable.");

        const candles = (await response.json()) as unknown;
        if (!Array.isArray(candles)) throw new Error("Invalid market history.");

        const history = candles
          .map((candle) => Number(Array.isArray(candle) ? candle[4] : NaN))
          .filter((price) => Number.isFinite(price) && price > 0);
        if (history.length < 2) throw new Error("Not enough market history.");

        hasHistory = true;
        if (active) {
          setPrices(history);
          setSpotPrice(history[history.length - 1]);
          setStatus("live");
        }
        return true;
      } catch {
        if (active && !controller.signal.aborted) setStatus("unavailable");
        return false;
      }
    }

    async function refreshSpotPrice() {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=XLMUSDT",
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Spot price is unavailable.");

        const result = (await response.json()) as { price?: string };
        const price = Number(result.price);
        if (!Number.isFinite(price) || price <= 0) throw new Error("Invalid spot price.");

        if (active) {
          setSpotPrice(price);
          setPrices((current) =>
            current.length > 0 ? [...current.slice(0, -1), price] : current,
          );
          setStatus("live");
        }
      } catch {
        if (active && !controller.signal.aborted) {
          setStatus((current) => (current === "live" ? "delayed" : current));
        }
      }
    }

    void loadHistory().then((loaded) => {
      if (loaded && active) void refreshSpotPrice();
    });
    const interval = window.setInterval(() => {
      if (!hasHistory) {
        void loadHistory().then((loaded) => {
          if (loaded && active) void refreshSpotPrice();
        });
      } else {
        void refreshSpotPrice();
      }
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
      controller.abort();
    };
  }, []);

  const chart = useMemo(() => {
    if (prices.length < 2) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || max * 0.001;
    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 400;
      const y = 96 - ((price - min) / range) * 70;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    const line = `M ${points.join(" L ")}`;
    const area = `${line} L 400,108 L 0,108 Z`;
    const [lastX, lastY] = points[points.length - 1].split(",");
    return { line, area, lastX, lastY };
  }, [prices]);

  const statusLabel = {
    loading: "CONNECTING",
    live: "LIVE 24H",
    delayed: "DELAYED",
    unavailable: "OFFLINE",
  }[status];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-indigo-100">
          Live Yield &amp; Market Velocity
        </p>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold sm:text-[10px] ${
            status === "live"
              ? "bg-emerald-500/20 text-emerald-200"
              : status === "delayed"
                ? "bg-amber-500/20 text-amber-200"
                : "bg-white/10 text-indigo-100"
          }`}
          aria-live="polite"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "live"
                ? "animate-quantum-blink bg-emerald-300"
                : status === "delayed"
                  ? "bg-amber-300"
                  : "bg-slate-300"
            }`}
          />
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 h-[108px]">
        {chart ? (
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 400 112"
            preserveAspectRatio="none"
            role="img"
            aria-label={`24-hour XLM market price chart${spotPrice ? `, current price ${spotPrice} USDT` : ""}`}
          >
            <defs>
              <linearGradient id="market-area-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#31e6a3" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#31e6a3" stopOpacity="0.02" />
              </linearGradient>
            </defs>
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
            <circle cx={chart.lastX} cy={chart.lastY} r="4" fill="#fff" />
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-indigo-100/75">
            {status === "unavailable"
              ? "Live market data is unavailable."
              : "Loading 24-hour market data…"}
          </div>
        )}
      </div>
      {spotPrice !== null && (
        <p className="sr-only" aria-live="polite">
          Current XLM price: {spotPrice} USDT
        </p>
      )}
    </div>
  );
}

export function VaultHero() {
  const [walletOpen, setWalletOpen] = useState(false);
  const { addresses, loading: addressesLoading } = useDepositAddresses();
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
          <p className="mt-1 text-[32px] font-black leading-none tracking-tight sm:text-[38px] lg:text-[44px]">$0.00</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-indigo-100">
            <span className="font-semibold text-emerald-300">↗ 3.48%</span>
            <span aria-hidden="true" className="text-indigo-200/60">·</span>
            <span>Available Assets: <span className="font-semibold">$0.00</span></span>
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

      <div className="relative mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <MarketVelocity />

        <div className="flex min-h-[184px] flex-col items-center rounded-2xl bg-white p-4 text-slate-800 shadow-lg sm:p-5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-slate-700">
            Scan to Pay
          </p>
          {addressesLoading ? (
            <div className="mt-2 flex h-[112px] w-[112px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-center text-[10px] text-slate-500">
              Loading payment address…
            </div>
          ) : paymentAddress ? (
            <Link
              href="/dashboard/qr-payment"
              aria-label={`Open ${paymentAddress.symbol} QR payment`}
              className="mt-2 flex h-[112px] w-[112px] items-center justify-center rounded-xl border border-slate-100 bg-white p-1 transition hover:shadow-md focus-visible:outline-indigo-500"
            >
              <span id="overview-payment-qr">
                <QRCodeSVG
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  includeMargin
                  level="M"
                  size={102}
                  value={paymentQrValue}
                />
              </span>
            </Link>
          ) : (
            <Link
              href="/dashboard/qr-payment"
              className="mt-2 flex h-[112px] w-[112px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-[10px] font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Payment QR unavailable. Open QR payment setup.
            </Link>
          )}
          <div className="mt-2 flex items-center justify-center gap-3">
            <Link
              href="/dashboard/qr-payment"
              className="text-center text-[10px] text-slate-500 hover:text-indigo-600"
            >
              {paymentAddress
                ? `${paymentAddress.symbol} · Click QR to open`
                : "Open QR payment"}
            </Link>
            {paymentAddress && !addressesLoading && (
              <button
                type="button"
                onClick={downloadPaymentQr}
                aria-label="Download payment QR code"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Download size={12} /> Download
              </button>
            )}
          </div>
        </div>
      </div>

      <ConnectWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </section>
  );
}
