"use client";

import { Bitcoin, DollarSign, Sparkles, Zap, ArrowUpRight } from "lucide-react";
import {
  useWalletBalances,
  type WalletAsset,
} from "@/lib/hooks/use-wallet-balances";
import type { WalletCurrency } from "@/lib/server/wallet-currency";

type Presentation = {
  currency: WalletCurrency;
  icon: typeof DollarSign;
  name: string;
  unit: string;
  card: string;
  iconBg: string;
  iconColor: string;
  dollarDisplay?: boolean;
};

const ASSETS: Presentation[] = [
  {
    currency: "USDT",
    icon: DollarSign,
    name: "Tether USD",
    unit: "",
    card: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    dollarDisplay: true,
  },
  {
    currency: "BTC",
    icon: Bitcoin,
    name: "Bitcoin",
    unit: "BTC",
    card: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
  },
  {
    currency: "XLM",
    icon: Sparkles,
    name: "Stellar Lumens",
    unit: "XLM",
    card: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-500",
    iconColor: "text-white",
  },
  {
    currency: "XRP",
    icon: Zap,
    name: "Ripple XRP",
    unit: "XRP",
    card: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-500",
    iconColor: "text-white",
  },
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

type Badge = { label: string; tone: "up" | "down" | "flat" };

function changeBadge(asset: WalletAsset, pegged: boolean): Badge {
  if (pegged) return { label: "STABLE 0.00%", tone: "flat" };
  if (asset.changePct === null) return { label: "—", tone: "flat" };

  const sign = asset.changePct > 0 ? "+" : "";

  return {
    label: `${sign}${asset.changePct.toFixed(2)}%`,
    tone:
      asset.changePct > 0 ? "up" : asset.changePct < 0 ? "down" : "flat",
  };
}

const BADGE_TONE: Record<Badge["tone"], string> = {
  up: "bg-emerald-100 text-emerald-700",
  down: "bg-rose-100 text-rose-700",
  flat: "bg-slate-200 text-slate-600",
};

export function AvailableBalances() {
  const { assets, loading } = useWalletBalances();
  const byCurrency = new Map(assets.map((asset) => [asset.currency, asset]));

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-slate-900">Available Balances</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">Real-time asset valuations and 24h market movements</p>
        </div>
        <button className="inline-flex items-center gap-1 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
          Exchange Assets <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ASSETS.map((config) => {
          const Icon = config.icon;
          const asset = byCurrency.get(config.currency);
          const pegged = config.currency === "USDT";
          const badge = asset
            ? changeBadge(asset, pegged)
            : { label: "—", tone: "flat" as const };

          const amountText = loading
            ? "—"
            : config.dollarDisplay
              ? asset?.usdValue !== null && asset?.usdValue !== undefined
                ? formatUsd(asset.usdValue)
                : "—"
              : (asset?.amount ?? "0");

          const usdText = (() => {
            if (loading) return "—";
            if (config.dollarDisplay) return "1.00 USDT = $1.00 USD";
            return asset?.usdValue !== null && asset?.usdValue !== undefined
              ? `≈ ${formatUsd(asset.usdValue)} USD`
              : "Price unavailable";
          })();

          return (
            <div key={config.name} className={`rounded-2xl border p-5 ${config.card}`}>
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.iconBg}`}>
                  <Icon size={20} className={config.iconColor} />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE_TONE[badge.tone]}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="mt-3 text-[13px] font-semibold text-slate-700">{config.name}</p>
              <p className="mt-1 text-[22px] font-black tracking-tight text-slate-900">
                {amountText}{" "}
                <span className="text-[14px] font-bold text-slate-500">{config.unit}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{usdText}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
