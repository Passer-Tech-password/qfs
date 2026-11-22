"use client";

import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { RecordStatusBadge, formatRecordDate } from "@/components/dashboard/record-status";
import { RecordTable, RecordTableMessage } from "@/components/dashboard/record-table";

type DepositRecord = {
  id: string;
  asset?: string;
  symbol?: string;
  network?: string;
  usdAmount?: number;
  cryptoAmount?: number;
  txHash?: string;
  status?: string;
  createdAt?: unknown;
};

export default function DepositListPage() {
  const { records, loading, error } = useUserCollection<DepositRecord>("deposits");

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Deposit History</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Track all incoming blockchain and manual deposit requests.
          </p>
        </div>
        <Link
          href="/dashboard/deposit/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={15} /> New Deposit
        </Link>
      </div>

      <div className="dash-card mt-5 p-6">
        {loading ? (
          <RecordTableMessage>Loading your deposits…</RecordTableMessage>
        ) : error ? (
          <RecordTableMessage tone="error">{error}</RecordTableMessage>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Receipt size={26} className="text-slate-400" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-slate-700">No Deposits Found</p>
            <p className="mt-1.5 max-w-[340px] text-[12.5px] text-slate-500">
              You haven&apos;t initiated any deposits yet. Deposit crypto to start investing or
              transacting.
            </p>
            <Link
              href="/dashboard/deposit/new"
              className="dash-submit mt-5 inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[12.5px] font-bold text-white"
            >
              Deposit Funds Now
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
              { header: "Network", render: (row) => row.network || "—" },
              {
                header: "Amount (USD)",
                render: (row) => `$${(row.usdAmount ?? 0).toFixed(2)}`,
              },
              {
                header: "Crypto",
                render: (row) => `${(row.cryptoAmount ?? 0).toFixed(2)} ${row.symbol ?? ""}`.trim(),
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
        © 2026 Quantum Finance. All rights reserved.
      </footer>
    </div>
  );
}
