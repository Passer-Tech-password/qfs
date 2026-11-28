"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Search,
  Users,
  Ban,
  CheckCircle2,
  UserCog,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Shield,
  Clock3,
  Lock,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getFirebaseClients } from "@/lib/firebase/client";

type UserDoc = {
  uid: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  createdAt?: { seconds?: number } | null;
};

type AccountAction = "activate" | "suspend" | "block" | "close" | "delete";

// Account states and how they are surfaced across the table and drawer.
const STATUS_META: Record<
  string,
  { label: string; className: string; icon: typeof Ban }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
  suspended: {
    label: "Suspended",
    className: "bg-amber-50 text-amber-600",
    icon: Clock3,
  },
  blocked: {
    label: "Blocked",
    className: "bg-rose-50 text-rose-600",
    icon: Ban,
  },
  closed: {
    label: "Closed",
    className: "bg-slate-100 text-slate-500",
    icon: Lock,
  },
};

function statusMeta(status?: string) {
  return STATUS_META[status ?? "active"] ?? STATUS_META.active;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [filtered, setFiltered] = useState<UserDoc[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserDoc | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  // Destructive actions require an explicit confirmation step.
  const [pendingAction, setPendingAction] = useState<{
    user: UserDoc;
    action: AccountAction;
    title: string;
    text: string;
    confirmLabel: string;
  } | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const { db } = getFirebaseClients();
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(
        (d) => ({ uid: d.id, ...d.data() } as UserDoc),
      );
      setUsers(list);
      setFiltered(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      setFiltered(users);
      return;
    }
    setFiltered(
      users.filter(
        (u) =>
          `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase().includes(term) ||
          (u.email ?? "").toLowerCase().includes(term) ||
          (u.username ?? "").toLowerCase().includes(term),
      ),
    );
  }, [search, users]);

  // Status changes run through the admin-only API so the Firebase
  // Authentication record is disabled/enabled alongside the profile.
  async function applyAction(u: UserDoc, action: AccountAction) {
    setBusyUid(u.uid);
    try {
      const { auth } = getFirebaseClients();
      const current = auth.currentUser;

      if (!current) {
        throw new Error("Please sign in again.");
      }

      const token = await current.getIdToken();

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: u.uid, action }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "The account action failed.");
      }

      if (action === "delete") {
        setUsers((prev) => prev.filter((x) => x.uid !== u.uid));
        setSelected((prev) => (prev?.uid === u.uid ? null : prev));
      } else {
        const status = data.status as string;
        setUsers((prev) =>
          prev.map((x) => (x.uid === u.uid ? { ...x, status } : x)),
        );
        setSelected((prev) => (prev?.uid === u.uid ? { ...prev, status } : prev));
      }

      setToast(data.message ?? "Account updated.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "The account action failed.");
    } finally {
      setBusyUid(null);
      setPendingAction(null);
      setTimeout(() => setToast(null), 3500);
    }
  }

  // Suspend and block apply immediately; closing and deleting need confirmation.
  function requestAction(u: UserDoc, action: AccountAction) {
    if (action === "close" || action === "delete") {
      setPendingAction({
        user: u,
        action,
        title: action === "delete" ? "Delete this account?" : "Close this account?",
        text:
          action === "delete"
            ? "This permanently removes the user profile and their sign-in record. This action cannot be undone."
            : "The account will be closed and the user will no longer be able to sign in.",
        confirmLabel: action === "delete" ? "Delete account" : "Close account",
      });
      return;
    }

    applyAction(u, action);
  }

  async function toggleRole(u: UserDoc) {
    const newRole = u.role === "admin" ? "user" : "admin";
    try {
      const { db } = getFirebaseClients();
      await updateDoc(doc(db, "users", u.uid), { role: newRole });
      setUsers((prev) =>
        prev.map((x) => (x.uid === u.uid ? { ...x, role: newRole } : x)),
      );
      setToast(`Role updated to ${newRole}.`);
    } catch {
      setToast("Failed to update role.");
    }
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users size={20} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">All Users</h2>
            <p className="text-[12px] text-slate-500">
              {filtered.length} of {users.length} users
            </p>
          </div>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="dash-card p-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="dash-input h-11 w-full pl-10 pr-4 text-[13px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[#eef0f6] bg-slate-50/60">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  User
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Contact
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Role
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Joined
                </th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f8]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    Loading users…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const meta = statusMeta(u.status);
                  const StatusIcon = meta.icon;
                  const protectedAccount = u.role === "admin";
                  const busy = busyUid === u.uid;

                  return (
                  <tr key={u.uid} className="transition hover:bg-slate-50/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[12px] font-bold text-white">
                          {(u.firstName?.[0] ?? u.username?.[0] ?? "?").toUpperCase()}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          u.role === "admin"
                            ? "bg-violet-50 text-violet-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Shield size={10} /> {u.role ?? "user"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}
                      >
                        <StatusIcon size={10} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-500">
                      {u.createdAt?.seconds
                        ? new Date(u.createdAt.seconds * 1000).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelected(u)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => toggleRole(u)}
                          className="rounded-lg bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600 transition hover:bg-violet-100"
                          title="Toggle admin role"
                        >
                          <UserCog size={13} />
                        </button>
                        <button
                          onClick={() =>
                            requestAction(
                              u,
                              u.status === "active" ? "suspend" : "activate",
                            )
                          }
                          disabled={busy || protectedAccount}
                          title={
                            protectedAccount
                              ? "Administrator accounts cannot be modified"
                              : undefined
                          }
                          className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            u.status === "active"
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {busy ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : u.status === "active" ? (
                            "Suspend"
                          ) : (
                            "Activate"
                          )}
                        </button>
                        <button
                          onClick={() =>
                            requestAction(
                              u,
                              u.status === "blocked" ? "activate" : "block",
                            )
                          }
                          disabled={busy || protectedAccount}
                          title="Block account"
                          className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Ban size={13} />
                        </button>
                        <button
                          onClick={() => requestAction(u, "close")}
                          disabled={busy || protectedAccount}
                          title="Close account"
                          className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Lock size={13} />
                        </button>
                        <button
                          onClick={() => requestAction(u, "delete")}
                          disabled={busy || protectedAccount}
                          title="Delete account"
                          className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[15px] font-bold text-white">
                  {(selected.firstName?.[0] ?? "?").toUpperCase()}
                </span>
                <div>
                  <h3 className="text-[17px] font-bold text-slate-900">
                    {selected.firstName} {selected.lastName}
                  </h3>
                  <p className="text-[12px] text-slate-500">@{selected.username}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email</p>
                  <p className="text-[13px] font-semibold text-slate-700">{selected.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Phone size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Phone</p>
                  <p className="text-[13px] font-semibold text-slate-700">
                    {selected.phoneNumber ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Joined</p>
                  <p className="text-[13px] font-semibold text-slate-700">
                    {selected.createdAt?.seconds
                      ? new Date(selected.createdAt.seconds * 1000).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Shield size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Role</p>
                  <p className="text-[13px] font-semibold text-slate-700">
                    {selected.role ?? "user"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <CheckCircle2 size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Account status
                  </p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      statusMeta(selected.status).className
                    }`}
                  >
                    {statusMeta(selected.status).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => toggleRole(selected)}
                className="w-full rounded-xl bg-violet-50 py-2.5 text-[12px] font-bold text-violet-600 transition hover:bg-violet-100"
              >
                {selected.role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>

              {selected.role === "admin" ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                  Administrator accounts cannot be suspended, blocked, closed, or
                  deleted from this page.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        requestAction(
                          selected,
                          selected.status === "active" ? "suspend" : "activate",
                        )
                      }
                      disabled={busyUid === selected.uid}
                      className={`rounded-xl py-2.5 text-[12px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected.status === "active"
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {selected.status === "active" ? "Suspend" : "Activate"}
                    </button>
                    <button
                      onClick={() =>
                        requestAction(
                          selected,
                          selected.status === "blocked" ? "activate" : "block",
                        )
                      }
                      disabled={busyUid === selected.uid}
                      className="rounded-xl bg-rose-50 py-2.5 text-[12px] font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selected.status === "blocked" ? "Unblock" : "Block"}
                    </button>
                    <button
                      onClick={() => requestAction(selected, "close")}
                      disabled={busyUid === selected.uid}
                      className="rounded-xl bg-slate-100 py-2.5 text-[12px] font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Close Account
                    </button>
                    <button
                      onClick={() => requestAction(selected, "delete")}
                      disabled={busyUid === selected.uid}
                      className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-[12px] font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Destructive action confirmation */}
      {pendingAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => {
              if (busyUid !== pendingAction.user.uid) setPendingAction(null);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle size={18} />
              </span>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  {pendingAction.title}
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  {pendingAction.text}
                </p>
                <p className="mt-2 text-[12px] font-semibold text-slate-700">
                  {pendingAction.user.firstName} {pendingAction.user.lastName}
                  {pendingAction.user.email ? ` · ${pendingAction.user.email}` : ""}
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setPendingAction(null)}
                disabled={busyUid === pendingAction.user.uid}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-[12px] font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  applyAction(pendingAction.user, pendingAction.action)
                }
                disabled={busyUid === pendingAction.user.uid}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-[12px] font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyUid === pendingAction.user.uid ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  pendingAction.confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
