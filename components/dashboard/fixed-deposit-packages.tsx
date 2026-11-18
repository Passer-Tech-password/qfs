import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FixedDepositPackages() {
  return (
    <div className="dash-card p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
          High APY Fixed Vault
        </span>
        <span className="text-[13px] font-bold text-emerald-600">Up to 20%</span>
      </div>

      <h3 className="mt-3 text-[17px] font-bold text-slate-900">Fixed Deposit Packages</h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
        Lock your funds into guaranteed daily returns with our Basic, Silver, Gold, and Platinum tiers.
      </p>

      <dl className="mt-5 space-y-2.5 rounded-xl bg-slate-50 p-4 text-[13px]">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Active Contracts:</dt>
          <dd className="font-bold text-slate-900">0</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Locked Capital:</dt>
          <dd className="font-bold text-slate-900">$0.00</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Daily APY Yield:</dt>
          <dd className="font-bold text-indigo-600">+$0.00/day</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Total APY Earned:</dt>
          <dd className="font-bold text-emerald-600">+$0.00</dd>
        </div>
      </dl>

      <Link
        href="/dashboard/fixed-deposit/new"
        className="dash-submit mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold"
      >
        Open New Fixed Deposit <ArrowRight size={15} />
      </Link>
    </div>
  );
}
