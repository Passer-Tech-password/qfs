"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  X,
  RefreshCw,
} from "lucide-react";
import {
  deleteDepositAddress,
  saveDepositAddress,
  setDepositAddressEnabled,
  type DepositAddress,
  type DepositAddressInput,
} from "@/lib/firebase/deposit-addresses";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";

const emptyForm: DepositAddressInput = {
  asset: "",
  symbol: "",
  network: "",
  address: "",
  memo: "",
  rateLabel: "",
  enabled: true,
  order: 0,
};

export default function AdminDepositAddressesPage() {
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<DepositAddressInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { db } = getFirebaseClients();
      const snap = await getDocs(collection(db, "deposit_addresses"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as DepositAddress))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setAddresses(list);
    } catch {
      showToast("Failed to load deposit addresses.");
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
    setForm({ ...emptyForm, order: addresses.length });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a: DepositAddress) {
    setForm({
      asset: a.asset,
      symbol: a.symbol,
      network: a.network,
      address: a.address,
      memo: a.memo ?? "",
      rateLabel: a.rateLabel ?? "",
      enabled: a.enabled !== false,
      order: a.order ?? 0,
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset.trim() || !form.symbol.trim() || !form.network.trim() || !form.address.trim()) {
      showToast("Asset, symbol, network and address are required.");
      return;
    }
    setSaving(true);
    try {
      await saveDepositAddress(
        {
          ...form,
          asset: form.asset.trim(),
          symbol: form.symbol.trim().toUpperCase(),
          network: form.network.trim(),
          address: form.address.trim(),
        },
        editingId ?? undefined,
      );
      showToast(editingId ? "Deposit address updated." : "Deposit address added.");
      closeForm();
      load();
    } catch {
      showToast("Failed to save deposit address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(a: DepositAddress) {
    try {
      await setDepositAddressEnabled(a.id, a.enabled === false);
      setAddresses((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, enabled: x.enabled === false } : x)),
      );
      showToast(a.enabled === false ? "Address enabled." : "Address disabled.");
    } catch {
      showToast("Failed to update address.");
    }
  }

  async function handleDelete(a: DepositAddress) {
    if (!confirm(`Delete the ${a.symbol} (${a.network}) deposit address?`)) return;
    try {
      await deleteDepositAddress(a.id);
      setAddresses((prev) => prev.filter((x) => x.id !== a.id));
      showToast("Deposit address deleted.");
    } catch {
      showToast("Failed to delete address.");
    }
  }

  function handleCopy(a: DepositAddress) {
    navigator.clipboard?.writeText(a.address).catch(() => {});
    setCopiedId(a.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Wallet size={20} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">Deposit Receiving Addresses</h2>
            <p className="text-[12px] text-slate-500">
              Publish the wallet / crypto addresses members copy when funding their account.
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
            <Plus size={14} /> Add Address
          </button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50" onClick={closeForm} />
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef0f6] pb-4">
              <h3 className="text-[18px] font-bold text-slate-900">
                {editingId ? "Edit Deposit Address" : "Add Deposit Address"}
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Asset / Coin Name *
                  </label>
                  <input
                    value={form.asset}
                    onChange={(e) => setForm({ ...form, asset: e.target.value })}
                    placeholder="e.g. Tether USD"
                    required
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Symbol *
                  </label>
                  <input
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    placeholder="e.g. USDT"
                    required
                    className="dash-input h-11 w-full px-4 text-[13px] uppercase"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Network *
                  </label>
                  <input
                    value={form.network}
                    onChange={(e) => setForm({ ...form, network: e.target.value })}
                    placeholder="e.g. TRC20"
                    required
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Receiving Wallet / Crypto Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Paste the destination wallet address members should send funds to…"
                  rows={2}
                  required
                  className="dash-input w-full resize-y px-4 py-3 font-mono text-[12.5px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Memo / Tag (Optional)
                  </label>
                  <input
                    value={form.memo}
                    onChange={(e) => setForm({ ...form, memo: e.target.value })}
                    placeholder="e.g. XRP destination tag"
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Rate Label (Optional)
                  </label>
                  <input
                    value={form.rateLabel}
                    onChange={(e) => setForm({ ...form, rateLabel: e.target.value })}
                    placeholder="e.g. 1 USDT = $1.00 USD"
                    className="dash-input h-11 w-full px-4 text-[13px]"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-[13px] font-medium text-slate-700">
                  Visible to members on the deposit page
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 disabled:opacity-60"
                >
                  <Save size={15} /> {editingId ? "Update Address" : "Save Address"}
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

      {/* List */}
      <div className="dash-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Loading addresses…</div>
        ) : addresses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Wallet size={26} />
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-slate-700">No deposit addresses yet</h3>
            <p className="mt-1 text-[12px] text-slate-500">
              Add the first receiving address so members can fund their accounts.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-indigo-700"
            >
              <Plus size={14} /> Add Address
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f3f8]">
            {addresses.map((a) => (
              <div key={a.id} className="flex flex-wrap items-start gap-4 p-5 transition hover:bg-slate-50/40">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-[12px] font-black text-white">
                  {a.symbol.slice(0, 4)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[14px] font-bold text-slate-900">{a.asset}</h4>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {a.network}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        a.enabled === false
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {a.enabled === false ? <EyeOff size={9} /> : <Eye size={9} />}
                      {a.enabled === false ? "Hidden" : "Visible"}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <code className="max-w-[420px] truncate rounded-md bg-slate-50 px-2 py-1 text-[11.5px] text-slate-600">
                      {a.address}
                    </code>
                    <button
                      onClick={() => handleCopy(a)}
                      aria-label="Copy address"
                      className="text-slate-400 transition hover:text-indigo-600"
                    >
                      {copiedId === a.id ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>

                  {a.memo && <p className="mt-1 text-[11px] text-slate-400">Memo: {a.memo}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => openEdit(a)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleToggle(a)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                      a.enabled === false
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                    }`}
                  >
                    {a.enabled === false ? <Eye size={12} /> : <EyeOff size={12} />}
                    {a.enabled === false ? "Show" : "Hide"}
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
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

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
