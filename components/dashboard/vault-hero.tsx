import { Wallet, Plus, ArrowUpRight, QrCode, Sparkles } from "lucide-react";

export function VaultHero() {
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
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-bold text-indigo-700 transition hover:bg-indigo-50">
              <Wallet size={15} /> Connect Wallet
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/20">
              <Plus size={15} /> Deposit
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/20">
              <ArrowUpRight size={15} /> Withdraw
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/20">
              <QrCode size={15} /> QR Pay
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-semibold text-indigo-100">Live Yield &amp; Market Velocity</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> LIVE 24H
            </span>
          </div>
          <div className="mt-5 flex h-28 items-end gap-1.5">
            {[30, 42, 38, 55, 48, 62, 58, 72, 66, 80, 74, 88, 82, 95].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-indigo-400/40 to-cyan-300/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl bg-white p-5 text-slate-800 shadow-lg">
          <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500">Scan to Pay</p>
          <div className="mt-3 flex h-[140px] w-[140px] items-center justify-center rounded-xl border border-slate-100 bg-white">
            <QrCode size={110} className="text-slate-900" strokeWidth={1.4} />
          </div>
          <p className="mt-3 text-center text-[10.5px] text-slate-400">Click QR to open / download</p>
        </div>
      </div>
    </section>
  );
}
