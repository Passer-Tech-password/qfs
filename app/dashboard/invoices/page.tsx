import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function InvoiceListPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Invoices</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Track and manage billed invoices and client settlements.
          </p>
        </div>
        <Link
          href="/dashboard/invoice/create"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={15} /> Create Invoice
        </Link>
      </div>

      <div className="dash-card mt-5 p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <FileText size={26} className="text-slate-400" />
          </div>
          <p className="mt-4 text-[15px] font-bold text-slate-700">No Invoices Issued</p>
          <p className="mt-1.5 max-w-[380px] text-[12.5px] text-slate-500">
            Create customizable crypto and fiat invoices for global clients.
          </p>
          <Link
            href="/dashboard/invoice/create"
            className="dash-submit mt-5 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[12.5px] font-bold text-white"
          >
            Create First Invoice
          </Link>
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfstier-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
