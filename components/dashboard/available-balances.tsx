import { DollarSign, Bitcoin, Sparkles, Zap, ArrowUpRight } from "lucide-react";

type Asset = {
  icon: typeof DollarSign;
  name: string;
  amount: string;
  unit: string;
  usd: string;
  change: string;
  changeTone: "up" | "flat";
  card: string;
  iconBg: string;
  iconColor: string;
};

const assets: Asset[] = [
  {
    icon: DollarSign,
    name: "Tether USD",
    amount: "$0.00",
    unit: "",
    usd: "1.00 USDT = $1.00 USD",
    change: "STABLE 0.00%",
    changeTone: "flat",
    card: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
  },
  {
    icon: Bitcoin,
    name: "Bitcoin",
    amount: "0.000000",
    unit: "BTC",
    usd: "≈ $0.00 USD",
    change: "+2.45%",
    changeTone: "up",
    card: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500",
    iconColor: "text-white",
  },
  {
    icon: Sparkles,
    name: "Stellar Lumens",
    amount: "0.0000",
    unit: "XLM",
    usd: "≈ $0.00 USD",
    change: "+4.82%",
    changeTone: "up",
    card: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-500",
    iconColor: "text-white",
  },
  {
    icon: Zap,
    name: "Ripple XRP",
    amount: "0.00",
    unit: "XRP",
    usd: "≈ $0.00 USD",
    change: "+1.95%",
    changeTone: "up",
    card: "bg-sky-50 border-sky-100",
    iconBg: "bg-sky-500",
    iconColor: "text-white",
  },
];

export function AvailableBalances() {
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
        {assets.map((asset) => {
          const Icon = asset.icon;
          return (
            <div key={asset.name} className={`rounded-2xl border p-5 ${asset.card}`}>
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${asset.iconBg}`}>
                  <Icon size={20} className={asset.iconColor} />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    asset.changeTone === "up"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {asset.change}
                </span>
              </div>
              <p className="mt-3 text-[13px] font-semibold text-slate-700">{asset.name}</p>
              <p className="mt-1 text-[22px] font-black tracking-tight text-slate-900">
                {asset.amount} <span className="text-[14px] font-bold text-slate-500">{asset.unit}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{asset.usd}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
