"use client";

import Link from "next/link";
import { Send, Plus } from "lucide-react";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { RecordStatusBadge, formatRecordDate } from "@/components/dashboard/record-status";
import { RecordTable, RecordTableMessage } from "@/components/dashboard/record-table";

type PayoutRecord = {
  id: string;
  asset?: string;
  method?: string;
  address?: string;
  amount?: number;
  status?: string;
  createdAt?: unknown;
};

export default function PayoutListPage() {
  const { records, loading, error } = useUserCollection<PayoutRecord>("payouts");

  return (
    <div className="mx-auto max-w-[1180px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-slate-900">
            Payout History
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Track status of blockchain withdrawals and bank disbursements.
          </p>
        </div>
        <Link
          href="/dashboard/payout/request"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
        >
          <Plus size={16} />
          Request Payout
        </Link>
      </div>

      {loading ? (
        <div className="dash-card mt-6 p-6">
          <RecordTableMessage>Loading your payouts…</RecordTableMessage>
        </div>
      ) : error ? (
        <div className="dash-card mt-6 p-6">
          <RecordTableMessage tone="error">{error}</RecordTableMessage>
        </div>
      ) : records.length === 0 ? (
        <div className="dash-card mt-6 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Send size={26} className="text-slate-400" />
          </div>
          <p className="mt-5 text-[16px] font-bold text-slate-800">No Payouts Yet</p>
          <p className="mt-1.5 max-w-[380px] text-[13px] text-slate-500">
            Request withdrawals to your external wallet or bank account whenever you want.
          </p>
          <Link
            href="/dashboard/payout/request"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
          >
            Request Payout Now
          </Link>
        </div>
      ) : (
        <div className="dash-card mt-6 p-6">
          <RecordTable
            rows={records}
            columns={[
              {
                header: "Asset",
                render: (row) => (
                  <span className="font-semibold text-slate-800">{row.asset || "—"}</span>
                ),
              },
              { header: "Method", render: (row) => row.method || "—" },
              {
                header: "Destination",
                render: (row) => (
                  <span className="block max-w-[220px] truncate font-mono text-[11.5px] text-slate-500">
                    {row.address || "—"}
                  </span>
                ),
              },
              {
                header: "Amount",
                render: (row) => `$${(row.amount ?? 0).toFixed(2)}`,
              },
              { header: "Date", render: (row) => formatRecordDate(row.createdAt) },
              {
                header: "Status",
                align: "right",
                render: (row) => <RecordStatusBadge status={row.status} />,
              },
            ]}
          />
        </div>
      )}

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfsiter-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
