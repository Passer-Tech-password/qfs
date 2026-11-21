"use client";

import Link from "next/link";
import { Plus, ArrowLeftRight } from "lucide-react";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { RecordStatusBadge, formatRecordDate } from "@/components/dashboard/record-status";
import { RecordTable, RecordTableMessage } from "@/components/dashboard/record-table";

type TransferRecord = {
  id: string;
  asset?: string;
  symbol?: string;
  network?: string;
  recipient?: string;
  usdAmount?: number;
  coinAmount?: number;
  status?: string;
  createdAt?: unknown;
};

export default function TransferListPage() {
  const { records, loading, error } = useUserCollection<TransferRecord>("transfers");

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Transfer Records</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            History of all inbound and outbound fund transfers.
          </p>
        </div>
        <Link
          href="/dashboard/send"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={15} /> New Transfer
        </Link>
      </div>

      <div className="dash-card mt-5 p-6">
        {loading ? (
          <RecordTableMessage>Loading your transfers…</RecordTableMessage>
        ) : error ? (
          <RecordTableMessage tone="error">{error}</RecordTableMessage>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ArrowLeftRight size={26} className="text-slate-400" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-slate-700">No Transfers Found</p>
            <p className="mt-1.5 max-w-[340px] text-[12.5px] text-slate-500">
              You haven&apos;t sent or received any direct wallet transfers yet.
            </p>
            <Link
              href="/dashboard/send"
              className="dash-submit mt-5 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[12.5px] font-bold text-white"
            >
              Send Money Now
            </Link>
          </div>
        ) : (
          <RecordTable
            rows={records}
            columns={[
              {
                header: "Asset",
                render: (row) => (
                  <span className="font-semibold text-slate-800">{row.symbol || row.asset || "—"}</span>
                ),
              },
              { header: "Recipient", render: (row) => row.recipient || "—" },
              {
                header: "Amount (USD)",
                render: (row) => `$${(row.usdAmount ?? 0).toFixed(2)}`,
              },
              {
                header: "Coins",
                render: (row) => `${(row.coinAmount ?? 0).toFixed(4)} ${row.symbol ?? ""}`.trim(),
              },
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
        © 2026 Qfs Tier-4B. All rights reserved.
      </footer>
    </div>
  );
}
