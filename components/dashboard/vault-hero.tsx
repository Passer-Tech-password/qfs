"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, Plus, ArrowUpRight, QrCode, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ConnectWalletModal } from "@/components/dashboard/connect-wallet-modal";
import { useDepositAddresses } from "@/lib/firebase/deposit-addresses";

type MarketStatus = "loading" | "live" | "delayed" | "unavailable";

type MarketSnapshot = { history: number[]; spot: number };

const CHART_POINTS = 24;

function validPrices(values: unknown[]): number[] {
  return values
    .map((value) => Number(value))
    .filter((price) => Number.isFinite(price) && price > 0);
}

// Reduce a longer series down to CHART_POINTS evenly spaced samples.
function downsample(values: number[], target = CHART_POINTS): number[] {
  if (values.length <= target) return values;
  const step = values.length / target;
  return Array.from({ length: target }, (_, index) =>
    values[Math.min(values.length - 1, Math.floor(index * step))],
  );
}

// Public XLM/USD market-data providers, tried in order until one responds. A
// single hard-coded exchange is unreliable (geo-blocking / CORS), so falling
// through this list keeps the dashboard chart live.
const marketProviders: {
  name: string;
  load: (signal: AbortSignal) => Promise<MarketSnapshot>;
}[] = [
  {
    name: "Kraken",
    async load(signal) {
      const [historyResponse, tickerResponse] = await Promise.all([
        fetch("https://api.kraken.com/0/public/OHLC?pair=XLMUSD&interval=60", {
          cache: "no-store",
          signal,
        }),
        fetch("https://api.kraken.com/0/public/Ticker?pair=XLMUSD", {
          cache: "no-store",
          signal,
        }),
      ]);
      if (!historyResponse.ok || !tickerResponse.ok) throw new Error("Kraken unavailable.");

      const historyData = (await historyResponse.json()) as { result?: Record<string, unknown> };
      const series = Object.values(historyData.result ?? {}).find((value) => Array.isArray(value));
      const rows = Array.isArray(series) ? (series as unknown[][]) : [];
      const history = validPrices(rows.map((row) => row[4])).slice(-CHART_POINTS);
      if (history.length < 2) throw new Error("Not enough Kraken history.");

      const tickerData = (await tickerResponse.json()) as {
        result?: Record<string, { c?: unknown[] }>;
      };
      const entry = Object.values(tickerData.result ?? {})[0];
      const spot = Number(Array.isArray(entry?.c) ? entry.c[0] : NaN);
      return {
        history,
        spot: Number.isFinite(spot) && spot > 0 ? spot : history[history.length - 1],
      };
    },
  },
  {
    name: "Binance",
    async load(signal) {
      const response = await fetch(
        "https://api.binance.com/api/v3/klines?symbol=XLMUSDT&interval=1h&limit=24",
        { cache: "no-store", signal },
      );
      if (!response.ok) throw new Error("Binance unavailable.");
      const candles = (await response.json()) as unknown;
      if (!Array.isArray(candles)) throw new Error("Invalid Binance history.");
      const history = validPrices(candles.map((candle) => (Array.isArray(candle) ? candle[4] : NaN)));
      if (history.length < 2) throw new Error("Not enough Binance history.");
      return { history, spot: history[history.length - 1] };
    },
  },
  {
    name: "CoinGecko",
    async load(signal) {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/stellar/market_chart?vs_currency=usd&days=1",
        { cache: "no-store", signal },
      );
      if (!response.ok) throw new Error("CoinGecko unavailable.");
      const data = (await response.json()) as { prices?: unknown[] };
      const history = downsample(
        validPrices((data.prices ?? []).map((point) => (Array.isArray(point) ? point[1] : NaN))),
      );
      if (history.length < 2) throw new Error("Not enough CoinGecko history.");
      return { history, spot: history[history.length - 1] };
    },
  },
];

function MarketVelocity() {
  const [prices, setPrices] = useState<number[]>([]);
  const [spotPrice, setSpotPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<MarketStatus>("loading");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    // Try each provider in turn; the first successful response wins.
    async function loadFromProviders(): Promise<boolean> {
      for (const provider of marketProviders) {
        try {
          const snapshot = await provider.load(controller.signal);
          if (!active) return true;
          setPrices(snapshot.history);
          setSpotPrice(snapshot.spot);
          setStatus("live");
          return true;
        } catch {
          if (controller.signal.aborted) return false;
          // Provider failed — fall through to the next one.
        }
      }
      return false;
    }

    void loadFromProviders().then((loaded) => {
      if (active && !loaded) setStatus("unavailable");
    });

    const interval = window.setInterval(() => {
      void loadFromProviders().then((loaded) => {
        if (!active || loaded) return;
        setStatus((current) =>
          current === "live" ? "delayed" : current === "loading" ? "unavailable" : current,
        );
      });
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
      controller.abort();
    };
  }, []);

  const chart = useMemo(() => {
    if (prices.length < 2) return null;

    // Scale the chart to the 24-hour history only. The indicator dot is mapped
    // through this same scale, so its vertical position is a direct, proportional
    // read of the market value: it rises when the price rises and falls when the
    // price falls.
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || max * 0.001;

    const liveValue =
      spotPrice !== null && Number.isFinite(spotPrice) ? spotPrice : prices[prices.length - 1];

    // Single value -> y mapper shared by the line and the dot so they always
    // stay aligned. Clamped only to keep the marker on-canvas.
    const toY = (price: number) => {
      const y = 100 - ((price - min) / range) * 38;
      return Math.min(106, Math.max(6, y));
    };

    // The final point carries the live value so the line ends where the dot sits.
    const series = [...prices.slice(0, -1), liveValue];
    const points = series.map((price, index) => {
      const x = (index / (series.length - 1)) * 400;
      return `${x.toFixed(2)},${toY(price).toFixed(2)}`;
    });

    const line = `M ${points.join(" L ")}`;
    const area = `${line} L 400,108 L 0,108 Z`;
    const lastX = "400.00";
    const lastY = toY(liveValue).toFixed(2);

    return { line, area, lastX, lastY };
  }, [prices, spotPrice]);

  const statusLabel = {
    loading: "CONNECTING",
    live: "LIVE 24H",
    delayed: "DELAYED",
    unavailable: "OFFLINE",
  }[status];

  return (
    <div className="flex min-h-[158px] flex-col rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5">
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
      <div className="mt-auto h-[92px] pt-2">
        {chart ? (
          <svg
            className="h-full w-full overflow-hidden"
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
