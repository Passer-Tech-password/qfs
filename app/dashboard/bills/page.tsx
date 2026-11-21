import Link from "next/link";
import { Plus, Receipt } from "lucide-react";

export default function BillListPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Paid Bills & Receipts</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            History of all processed utility, broadband, and mobile recharge receipts.
          </p>
        </div>
        <Link
          href="/dashboard/bill/pay"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={15} /> Pay Bill
        </Link>
      </div>

      <div className="dash-card mt-5 p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Receipt size={26} className="text-slate-400" />
          </div>
          <p className="mt-4 text-[15px] font-bold text-slate-700">No Bills Paid Yet</p>
          <p className="mt-1.5 max-w-[380px] text-[12.5px] text-slate-500">
            Pay your everyday bills and mobile recharges with instantaneous confirmation.
          </p>
          <Link
            href="/dashboard/bill/pay"
            className="dash-submit mt-5 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[12.5px] font-bold text-white"
          >
            Pay a Bill Now
          </Link>
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfs Tier-4B. All rights reserved.
      </footer>
    </div>
  );
}
