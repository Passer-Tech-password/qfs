"use client";

import Link from "next/link";
import { Plus, ArrowLeftRight } from "lucide-react";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { RecordStatusBadge, formatRecordDate } from "@/components/dashboard/record-status";
import { RecordTable, RecordTableMessage } from "@/components/dashboard/record-table";

type SwapRecord = {
  id: string;
  paySymbol?: string;
  receiveSymbol?: string;
  payAmount?: number;
  receiveAmount?: number;
  rate?: string;
  status?: string;
  createdAt?: unknown;
};

export default function AllSwapsPage() {
  const { records, loading, error } = useUserCollection<SwapRecord>("swaps");

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Exchange History</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Track all instant token exchanges and conversion rates.
          </p>
        </div>
        <Link
          href="/dashboard/swap"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={15} /> Swap Now
        </Link>
      </div>

      <div className="dash-card mt-5 p-6">
        {loading ? (
          <RecordTableMessage>Loading your exchanges…</RecordTableMessage>
        ) : error ? (
          <RecordTableMessage tone="error">{error}</RecordTableMessage>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ArrowLeftRight size={26} className="text-slate-400" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-slate-700">No Swap Records Found</p>
            <p className="mt-1.5 max-w-[340px] text-[12.5px] text-slate-500">
              Convert any crypto asset with zero slippage in seconds.
            </p>
            <Link
              href="/dashboard/swap"
              className="dash-submit mt-5 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[12.5px] font-bold text-white"
            >
              Start Instant Swap
            </Link>
          </div>
        ) : (
          <RecordTable
            rows={records}
            columns={[
              {
                header: "Pair",
                render: (row) => (
                  <span className="font-semibold text-slate-800">
                    {row.paySymbol || "—"} → {row.receiveSymbol || "—"}
                  </span>
                ),
              },
              {
                header: "Paid",
                render: (row) => `${(row.payAmount ?? 0)} ${row.paySymbol ?? ""}`.trim(),
              },
              {
                header: "Received",
                render: (row) => `${(row.receiveAmount ?? 0)} ${row.receiveSymbol ?? ""}`.trim(),
              },
              { header: "Rate", render: (row) => row.rate || "—" },
              { header: "Date", render: (row) => formatRecordDate(row.createdAt) },
              {
                header: "Status",
                align: "right",
                render: (row) => <RecordStatusBadge status={row.status} />,
              },
            ]}
          />
        )}
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfsiter-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
