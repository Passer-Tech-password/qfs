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
  FileEdit,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Calendar,
  Tag,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { getFirebaseClients } from "@/lib/firebase/client";

type SiteEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  imageUrl: string;
  linkUrl: string;
  published: boolean;
  createdAt?: { seconds?: number } | null;
  updatedAt?: { seconds?: number } | null;
};

const CATEGORIES = ["Announcement", "Event", "Update", "Security", "Product"];

const emptyForm: Omit<SiteEvent, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  description: "",
  category: "Announcement",
  eventDate: "",
  imageUrl: "",
  linkUrl: "",
  published: false,
};

export default function AdminContentPage() {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    try {
      const { db } = getFirebaseClients();
      const q = query(collection(db, "site_events"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() } as SiteEvent),
      );
      setEvents(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
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

  function openEdit(ev: SiteEvent) {
    setForm({
      title: ev.title,
      description: ev.description,
      category: ev.category,
      eventDate: ev.eventDate,
      imageUrl: ev.imageUrl,
      linkUrl: ev.linkUrl,
      published: ev.published,
    });
    setEditingId(ev.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const { db } = getFirebaseClients();
      if (editingId) {
        await updateDoc(doc(db, "site_events", editingId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        showToast("Event updated successfully.");
      } else {
        await addDoc(collection(db, "site_events"), {
          ...form,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast("Event created successfully.");
      }
      closeForm();
      loadEvents();
    } catch {
      showToast("Failed to save event.");
    }
  }

  async function togglePublish(ev: SiteEvent) {
    try {
      const { db } = getFirebaseClients();
      await updateDoc(doc(db, "site_events", ev.id), {
        published: !ev.published,
        updatedAt: serverTimestamp(),
      });
      setEvents((prev) =>
        prev.map((x) => (x.id === ev.id ? { ...x, published: !ev.published } : x)),
      );
      showToast(ev.published ? "Event unpublished." : "Event published.");
    } catch {
      showToast("Failed to update.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event? This action cannot be undone.")) return;
    try {
      const { db } = getFirebaseClients();
      await deleteDoc(doc(db, "site_events", id));
      setEvents((prev) => prev.filter((x) => x.id !== id));
      showToast("Event deleted.");
    } catch {
      showToast("Failed to delete event.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <FileEdit size={20} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Site Content &amp; Events</h2>
            <p className="text-[12px] text-slate-500">
              Manage events and announcements displayed on the public site.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-[12px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
          >
            <Plus size={14} /> New Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="dash-card p-4">
          <p className="text-[24px] font-black text-slate-900">{events.length}</p>
          <p className="text-[12px] font-semibold text-slate-500">Total Events</p>
        </div>
        <div className="dash-card p-4">
          <p className="text-[24px] font-black text-emerald-600">
            {events.filter((e) => e.published).length}
          </p>
          <p className="text-[12px] font-semibold text-slate-500">Published</p>
        </div>
        <div className="dash-card p-4">
          <p className="text-[24px] font-black text-amber-600">
            {events.filter((e) => !e.published).length}
          </p>
          <p className="text-[12px] font-semibold text-slate-500">Drafts</p>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50" onClick={closeForm} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef0f6] pb-4">
              <h3 className="text-[18px] font-bold text-slate-900">
                {editingId ? "Edit Event" : "Create New Event"}
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
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
                  placeholder="Event title…"
                  required
                  className="dash-input h-11 w-full px-4 text-[13px]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the event…"
                  rows={4}
                  className="dash-input w-full resize-y px-4 py-3 text-[13px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    <Tag size={11} /> Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    <Calendar size={11} /> Event Date
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  <ImageIcon size={11} /> Image URL
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://…"
                  className="dash-input h-11 w-full px-4 text-[13px]"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  <ExternalLink size={11} /> Link URL
                </label>
                <input
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="https://…"
                  className="dash-input h-11 w-full px-4 text-[13px]"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-[13px] font-medium text-slate-700">
                  Publish on public site
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
                >
                  <Save size={15} /> {editingId ? "Update Event" : "Create Event"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="dash-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <FileEdit size={26} />
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-slate-700">No events yet</h3>
            <p className="mt-1 text-[12px] text-slate-500">
              Create your first event to display on the public site.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-indigo-700"
            >
              <Plus size={14} /> Create Event
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f3f8]">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-4 p-5 transition hover:bg-slate-50/40">
                {ev.imageUrl ? (
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                    <FileEdit size={22} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[15px] font-bold text-slate-900">{ev.title}</h4>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                      {ev.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        ev.published
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {ev.published ? <Eye size={9} /> : <EyeOff size={9} />}
                      {ev.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] text-slate-500">
                    {ev.description || "No description."}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    {ev.eventDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} /> {new Date(ev.eventDate).toLocaleDateString()}
                      </span>
                    )}
                    {ev.linkUrl && (
                      <a
                        href={ev.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-500 hover:underline"
                      >
                        <ExternalLink size={11} /> View link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => openEdit(ev)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => togglePublish(ev)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                      ev.published
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {ev.published ? <EyeOff size={12} /> : <Eye size={12} />}
                    {ev.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
