import Link from "next/link";
import { Plus, Landmark } from "lucide-react";

export default function MyFixedDepositsPage() {
  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">My Fixed Deposits</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Track active investment earnings, daily profit accruals, and maturity dates.
          </p>
        </div>
        <Link
          href="/dashboard/fixed-deposit/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={15} /> New Fixed Deposit
        </Link>
      </div>

      <div className="dash-card mt-5 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Landmark size={30} className="text-slate-400" />
        </div>
        <h3 className="mt-5 text-[17px] font-bold text-slate-800">No Active Fixed Deposits</h3>
        <p className="mt-1.5 max-w-[420px] text-[13px] text-slate-500">
          You don't have any running fixed deposit packages. Start an investment package today.
        </p>
        <Link
          href="/dashboard/fixed-deposit/new"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-3 text-[13px] font-bold text-white transition hover:bg-indigo-700"
        >
          Start Fixed Deposit Now
        </Link>
      </div>

      <footer className="mt-12 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Quantum Finance. All rights reserved.
      </footer>
    </div>
  );
}
