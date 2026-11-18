"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Megaphone,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { getFirebaseClients } from "@/lib/firebase/client";

type Announcement = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "critical";
  active: boolean;
  createdAt?: { seconds?: number } | null;
};

const emptyForm = {
  title: "",
  message: "",
  type: "info" as Announcement["type"],
  active: true,
};

const TYPE_OPTIONS: { value: Announcement["type"]; label: string; color: string }[] = [
  { value: "info", label: "Info", color: "bg-blue-50 text-blue-600" },
  { value: "success", label: "Success", color: "bg-emerald-50 text-emerald-600" },
  { value: "warning", label: "Warning", color: "bg-amber-50 text-amber-600" },
  { value: "critical", label: "Critical", color: "bg-rose-50 text-rose-600" },
];

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { db } = getFirebaseClients();
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement)));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a: Announcement) {
    setForm({
      title: a.title,
      message: a.message,
      type: a.type,
      active: a.active,
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const { db } = getFirebaseClients();
      if (editingId) {
        await updateDoc(doc(db, "announcements", editingId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        showToast("Announcement updated.");
      } else {
        await addDoc(collection(db, "announcements"), {
          ...form,
          createdAt: serverTimestamp(),
        });
        showToast("Announcement created.");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch {
      showToast("Failed to save announcement.");
    }
  }

  async function toggleActive(a: Announcement) {
    try {
      const { db } = getFirebaseClients();
      await updateDoc(doc(db, "announcements", a.id), { active: !a.active });
      setItems((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x)),
      );
    } catch {
      showToast("Failed to update.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try {
      const { db } = getFirebaseClients();
      await deleteDoc(doc(db, "announcements", id));
      setItems((prev) => prev.filter((x) => x.id !== id));
      showToast("Announcement deleted.");
    } catch {
      showToast("Failed to delete.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Megaphone size={20} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Announcements</h2>
            <p className="text-[12px] text-slate-500">
              Broadcast messages to all platform users.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-[12px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
          >
            <Plus size={14} /> New Announcement
          </button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef0f6] pb-4">
              <h3 className="text-[18px] font-bold text-slate-900">
                {editingId ? "Edit Announcement" : "New Announcement"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title…"
                  required
                  className="dash-input h-11 w-full px-4 text-[13px]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Announcement message…"
                  rows={4}
                  className="dash-input w-full resize-y px-4 py-3 text-[13px]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Announcement["type"] })}
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-[13px] font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
                >
                  <Save size={15} /> {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="dash-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Bell size={26} />
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-slate-700">No announcements</h3>
            <p className="mt-1 text-[12px] text-slate-500">
              Create an announcement to broadcast to all users.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f3f8]">
            {items.map((a) => {
              const typeMeta = TYPE_OPTIONS.find((o) => o.value === a.type)!;
              return (
                <div key={a.id} className="flex items-start gap-4 p-5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${typeMeta.color}`}>
                    <Bell size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-[15px] font-bold text-slate-900">{a.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${typeMeta.color}`}>
                        {typeMeta.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          a.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {a.active ? <Eye size={9} /> : <EyeOff size={9} />}
                        {a.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-slate-500">{a.message || "No message."}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button
                      onClick={() => openEdit(a)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => toggleActive(a)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                        a.active
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {a.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
