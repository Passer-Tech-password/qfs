import Link from "next/link";
import { Boxes, ArrowUpRight, ListChecks } from "lucide-react";

export function RunningInvestments() {
  return (
    <div className="dash-card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-slate-900">Running Investments</h3>
        <button className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
      </div>

      <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Boxes size={26} className="text-slate-400" />
        </div>
        <p className="mt-4 text-[14px] font-bold text-slate-700">No active investments found</p>
        <p className="mt-1 max-w-[280px] text-[12px] text-slate-500">
          Start a new Fixed Deposit to begin earning daily returns.
        </p>
        <Link
          href="/dashboard/fixed-deposit/new"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-indigo-700"
        >
          Start Investing
        </Link>
      </div>
    </div>
  );
}

export function RecentTransactions() {
  return (
    <div className="dash-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-slate-900">Recent Transactions</h3>
        <button className="inline-flex items-center gap-1 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700">
          Full History <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
        <ListChecks size={28} className="text-slate-300" />
        <p className="mt-3 text-[13px] text-slate-400">No recent transactions to display.</p>
      </div>
    </div>
  );
}
