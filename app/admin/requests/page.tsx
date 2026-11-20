"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftRight,
  RefreshCw,
  Check,
  X,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import {
  MONEY_FLOWS,
  loadMoneyRequests,
  settleMoneyRequest,
  type MoneyFlowKey,
  type MoneyRequest,
} from "@/lib/firebase/admin-requests";
import { RecordStatusBadge, formatRecordDate } from "@/components/dashboard/record-status";

const HIDDEN_FIELDS = new Set(["status", "createdAt", "updatedAt", "settledAt"]);

function detailEntries(fields: Record<string, unknown>) {
  return Object.entries(fields)
    .filter(([key]) => !HIDDEN_FIELDS.has(key))
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 5);
}

function renderValue(value: unknown): string {
  if (typeof value === "number") return value.toLocaleString();
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function AdminRequestsPage() {
  const [flow, setFlow] = useState<MoneyFlowKey>("deposits");
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "settled">("pending");

  const load = useCallback(async (key: MoneyFlowKey) => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await loadMoneyRequests(key));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to load requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(flow);
  }, [flow, load]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function settle(request: MoneyRequest, status: "completed" | "rejected") {
    setActingId(request.id);
    try {
      await settleMoneyRequest(request, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status } : r)),
      );
      showToast(
        status === "completed"
          ? `${request.userLabel} — request approved.`
          : `${request.userLabel} — request rejected.`,
      );
    } catch {
      showToast("Failed to update the request. Please try again.");
    } finally {
      setActingId(null);
    }
  }

  const visible = requests.filter((r) => {
    if (filter === "pending") return r.status === "pending" || r.status === "processing";
    if (filter === "settled") return r.status === "completed" || r.status === "rejected";
    return true;
  });

  const pendingCount = requests.filter(
    (r) => r.status === "pending" || r.status === "processing",
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <ArrowLeftRight size={20} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Money Requests</h2>
            <p className="text-[12px] text-slate-500">
              {pendingCount} awaiting settlement across all members
            </p>
          </div>
        </div>
        <button
          onClick={() => load(flow)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Flow tabs */}
      <div className="flex flex-wrap gap-2">
        {MONEY_FLOWS.map((item) => (
          <button
            key={item.key}
            onClick={() => setFlow(item.key)}
            aria-pressed={flow === item.key}
            className={`rounded-lg px-3.5 py-2 text-[12px] font-semibold transition ${
              flow === item.key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {(["pending", "settled", "all"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition ${
              filter === key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="text-[12.5px] text-rose-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-[#eef0f6] bg-slate-50/60">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Member
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Details
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Submitted
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f8]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={16} className="animate-spin" /> Loading requests…
                    </span>
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    No requests to show.
                  </td>
                </tr>
              ) : (
                visible.map((request) => (
                  <tr key={`${request.uid}-${request.id}`} className="transition hover:bg-slate-50/40">
                    <td className="px-5 py-3.5 align-top">
                      <p className="text-[13px] font-semibold text-slate-800">
                        {request.userLabel}
                      </p>
                      <p className="text-[10.5px] text-slate-400">{request.uid.slice(0, 10)}…</p>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <dl className="space-y-0.5">
                        {detailEntries(request.fields).map(([key, value]) => (
                          <div key={key} className="flex gap-1.5 text-[11.5px]">
                            <dt className="font-semibold capitalize text-slate-400">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </dt>
                            <dd className="max-w-[240px] truncate text-slate-700">
                              {renderValue(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </td>
                    <td className="px-5 py-3.5 align-top text-[11.5px] text-slate-500">
                      {formatRecordDate(request.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <RecordStatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => settle(request, "completed")}
                          disabled={actingId === request.id || request.status === "completed"}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actingId === request.id ? (
                            <LoaderCircle size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => settle(request, "rejected")}
                          disabled={actingId === request.id || request.status === "rejected"}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={12} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
