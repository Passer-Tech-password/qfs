"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  Activity,
  RefreshCw,
  Send,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getFirebaseClients } from "@/lib/firebase/client";

type ActivityDoc = {
  id: string;
  type?: string;
  userEmail?: string;
  userName?: string;
  amount?: string;
  status?: string;
  createdAt?: { seconds?: number } | null;
  [key: string]: unknown;
};

const TYPE_META: Record<string, { icon: typeof Send; color: string; label: string }> = {
  deposit: { icon: ArrowDownLeft, color: "text-emerald-600 bg-emerald-50", label: "Deposit" },
  withdrawal: { icon: ArrowUpRight, color: "text-rose-600 bg-rose-50", label: "Withdrawal" },
  transfer: { icon: Send, color: "text-indigo-600 bg-indigo-50", label: "Transfer" },
  swap: { icon: RefreshCw, color: "text-violet-600 bg-violet-50", label: "Swap" },
  card: { icon: CreditCard, color: "text-amber-600 bg-amber-50", label: "Card" },
  wallet: { icon: Wallet, color: "text-cyan-600 bg-cyan-50", label: "Wallet" },
};

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  failed: "bg-rose-50 text-rose-600",
  processing: "bg-blue-50 text-blue-600",
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityDoc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { db } = getFirebaseClients();
      // Try to load from a generic activities collection; fall back gracefully.
      const collections = ["activities", "transactions", "deposits", "withdrawals"];
      const all: ActivityDoc[] = [];
      for (const col of collections) {
        try {
          const q = query(collection(db, col), orderBy("createdAt", "desc"), limit(20));
          const snap = await getDocs(q);
          snap.docs.forEach((d) =>
            all.push({ id: `${col}/${d.id}`, collection: col, ...d.data() } as ActivityDoc),
          );
        } catch {
          // collection may not exist
        }
      }
      setActivities(all.slice(0, 50));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Activity size={20} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Activity Monitor</h2>
            <p className="text-[12px] text-slate-500">
              Real-time overview of all platform transactions and events.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Activities", value: activities.length, color: "text-indigo-600" },
          {
            label: "Completed",
            value: activities.filter((a) => a.status === "completed").length,
            color: "text-emerald-600",
          },
          {
            label: "Pending",
            value: activities.filter((a) => a.status === "pending").length,
            color: "text-amber-600",
          },
          {
            label: "Failed",
            value: activities.filter((a) => a.status === "failed").length,
            color: "text-rose-600",
          },
        ].map((s) => (
          <div key={s.label} className="dash-card p-4">
            <p className={`text-[24px] font-black ${s.color}`}>{s.value}</p>
            <p className="text-[12px] font-semibold text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="dash-card overflow-hidden">
        <div className="border-b border-[#eef0f6] px-5 py-3.5">
          <h3 className="text-[15px] font-bold text-slate-900">Recent Activity</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading activities…</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Activity size={26} />
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-slate-700">No activity yet</h3>
            <p className="mt-1 text-[12px] text-slate-500">
              Transactions and platform events will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f3f8]">
            {activities.map((a) => {
              const meta = TYPE_META[a.type ?? ""] ?? {
                icon: Activity,
                color: "text-slate-600 bg-slate-100",
                label: a.type ?? "Activity",
              };
              const Icon = meta.icon;
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${meta.color}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-800">
                      {meta.label}
                      {a.userName ? ` — ${a.userName}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {a.userEmail ?? "—"}
                      {a.createdAt?.seconds
                        ? ` · ${new Date(a.createdAt.seconds * 1000).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  {a.amount && (
                    <span className="text-[13px] font-bold text-slate-800">{a.amount}</span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      STATUS_STYLES[a.status ?? ""] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {a.status ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
