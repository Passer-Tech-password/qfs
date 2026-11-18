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
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  LogIn,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { getFirebaseClients } from "@/lib/firebase/client";

type SecurityEvent = {
  id: string;
  type: "login" | "logout" | "failed_login" | "role_change" | "suspend";
  user?: string;
  detail?: string;
  severity?: "low" | "medium" | "high";
  createdAt?: { seconds?: number } | null;
};

const TYPE_META: Record<string, { icon: typeof LogIn; color: string; label: string }> = {
  login: { icon: LogIn, color: "text-emerald-600 bg-emerald-50", label: "Login" },
  logout: { icon: LogOut, color: "text-slate-600 bg-slate-100", label: "Logout" },
  failed_login: { icon: ShieldX, color: "text-rose-600 bg-rose-50", label: "Failed Login" },
  role_change: { icon: ShieldCheck, color: "text-violet-600 bg-violet-50", label: "Role Change" },
  suspend: { icon: Lock, color: "text-amber-600 bg-amber-50", label: "Suspend" },
};

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  high: "bg-rose-50 text-rose-600",
};

function formatTime(ts?: { seconds?: number } | null) {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleString();
}

export default function AdminSecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { db } = getFirebaseClients();
      const q = query(
        collection(db, "security_logs"),
        orderBy("createdAt", "desc"),
        limit(100),
      );
      const snap = await getDocs(q);
      setEvents(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as SecurityEvent)),
      );
    } catch {
      setError("Unable to load security logs. Check your Firestore permissions.");
      setEvents([]);
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
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert size={20} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Security Log</h2>
            <p className="text-[12px] text-slate-500">
              Track authentication events and security-related actions.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="dash-card p-4">
          <p className="text-[24px] font-black text-emerald-600">
            {events.filter((e) => (e.severity ?? "low") === "low").length}
          </p>
          <p className="text-[12px] font-semibold text-slate-500">Low Severity</p>
        </div>
        <div className="dash-card p-4">
          <p className="text-[24px] font-black text-amber-600">
            {events.filter((e) => e.severity === "medium").length}
          </p>
          <p className="text-[12px] font-semibold text-slate-500">Medium Severity</p>
        </div>
        <div className="dash-card p-4">
          <p className="text-[24px] font-black text-rose-600">
            {events.filter((e) => e.severity === "high").length}
          </p>
          <p className="text-[12px] font-semibold text-slate-500">High Severity</p>
        </div>
      </div>

      <div className="dash-card overflow-hidden">
        <div className="border-b border-[#eef0f6] px-5 py-3.5">
          <h3 className="text-[15px] font-bold text-slate-900">Recent Security Events</h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading security events…</div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
              <ShieldAlert size={26} />
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-slate-700">Security log unavailable</h3>
            <p className="mt-1 text-[12px] text-slate-500">{error}</p>
            <button
              onClick={load}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <ShieldAlert size={26} />
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-slate-700">No security events yet</h3>
            <p className="mt-1 text-[12px] text-slate-500">
              Authentication and security activity will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f3f8]">
            {events.map((e) => {
              const meta = TYPE_META[e.type] ?? {
                icon: ShieldAlert,
                color: "text-slate-600 bg-slate-100",
                label: e.type ?? "Event",
              };
              const Icon = meta.icon;
              const severity = e.severity ?? "low";
              return (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${meta.color}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-800">{meta.label}</p>
                    <p className="text-[11px] text-slate-500">{e.user ?? "—"}</p>
                  </div>
                  <div className="hidden text-[12px] text-slate-600 sm:block">
                    {e.detail ?? "—"}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.low
                    }`}
                  >
                    {severity.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400">{formatTime(e.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
