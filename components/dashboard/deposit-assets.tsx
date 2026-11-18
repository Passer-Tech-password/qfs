"use client";

import {
  DollarSign,
  Bitcoin,
  Diamond,
  Rocket,
  Zap,
  Layers,
  Coins,
  LayoutGrid,
} from "lucide-react";

type DepositAsset = {
  icon: typeof DollarSign;
  name: string;
  amount: string;
  unit: string;
  badge: string;
  card: string;
  iconBg: string;
  iconColor: string;
  badgeTone: string;
};

const depositAssets: DepositAsset[] = [
  {
    icon: DollarSign,
    name: "Tether USD",
    amount: "$0.00",
    unit: "USDT",
    badge: "USDT",
    card: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    badgeTone: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Bitcoin,
    name: "Bitcoin",
    amount: "0.000000",
    unit: "BTC",
    badge: "BTC",
    card: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    badgeTone: "bg-amber-100 text-amber-700",
  },
  {
    icon: Diamond,
    name: "Ethereum",
    amount: "0.0000",
    unit: "ETH",
    badge: "ETH",
    card: "bg-indigo-50 border-indigo-100",
    iconBg: "bg-indigo-500",
    iconColor: "text-white",
    badgeTone: "bg-white text-indigo-600",
  },
  {
    icon: Rocket,
    name: "Stellar",
    amount: "0.0000",
    unit: "XLM",
    badge: "XLM",
    card: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-500",
    iconColor: "text-white",
    badgeTone: "bg-violet-100 text-violet-700",
  },
  {
    icon: Zap,
    name: "XRP",
    amount: "0.00",
    unit: "XRP",
    badge: "XRP",
    card: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-500",
    iconColor: "text-white",
    badgeTone: "bg-sky-100 text-sky-700",
  },
  {
    icon: Layers,
    name: "BNB",
    amount: "0.0000",
    unit: "BNB",
    badge: "BNB",
    card: "bg-yellow-50 border-yellow-100",
    iconBg: "bg-yellow-400",
    iconColor: "text-white",
    badgeTone: "bg-white text-slate-700",
  },
  {
    icon: Rocket,
    name: "Solana",
    amount: "0.0000",
    unit: "SOL",
    badge: "SOL",
    card: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-500",
    iconColor: "text-white",
    badgeTone: "bg-white text-slate-700",
  },
  {
    icon: Coins,
    name: "Polygon",
    amount: "0.0000",
    unit: "MATIC",
    badge: "MATIC",
    card: "bg-teal-50 border-teal-100",
    iconBg: "bg-teal-600",
    iconColor: "text-white",
    badgeTone: "bg-teal-100 text-teal-700",
  },
  {
    icon: Coins,
    name: "Tron",
    amount: "0.00",
    unit: "TRX",
    badge: "TRX",
    card: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-500",
    iconColor: "text-white",
    badgeTone: "bg-white text-slate-700",
  },
];

export function DepositAssets() {
  return (
    <section className="mt-1">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-slate-900">Available Balances</h2>
        </div>
        <p className="text-[12px] font-medium text-slate-400">All Supported Currencies</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {depositAssets.map((asset) => {
          const Icon = asset.icon;
          return (
            <div
              key={asset.unit}
              className={`relative flex flex-col rounded-2xl border p-4 ${asset.card}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${asset.iconBg}`}
                >
                  <Icon size={20} className={asset.iconColor} />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${asset.badgeTone}`}
                >
                  {asset.badge}
                </span>
              </div>

              <p className="mt-3 text-[12.5px] font-semibold text-slate-600">
                {asset.name} Balance
              </p>
              <p className="mt-0.5 text-[22px] font-black tracking-tight text-slate-900">
                {asset.amount}{" "}
                <span className="text-[13px] font-bold text-slate-500">{asset.unit}</span>
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2.5">
                <button className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700">
                  Click to Deposit
                </button>
                <LayoutGrid size={15} className="text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
