
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Wallet,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  UserRound,
  Loader2,
} from "lucide-react";
import { getFirebaseClients } from "@/lib/firebase/client";

type User = {
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  status: string;
};

type Currency = "USDT" | "BTC" | "XLM" | "XRP";

const CURRENCIES: Currency[] = ["USDT", "BTC", "XLM", "XRP"];

const DECIMALS: Record<Currency, number> = {
  USDT: 6,
  BTC: 8,
  XLM: 7,
  XRP: 6,
};

function formatBalance(value: number, currency: Currency) {
  return (value / 10 ** DECIMALS[currency]).toFixed(DECIMALS[currency]);
}

export default function AdminFundingPage() {
  const [term, setTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);

  const [balances, setBalances] = useState<Record<Currency, number>>({
    USDT: 0,
    BTC: 0,
    XLM: 0,
    XRP: 0,
  });

  const [currency, setCurrency] = useState<Currency>("USDT");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Preserve the same idempotency key when retrying an uncertain request.
  const [pendingIdempotencyKey, setPendingIdempotencyKey] = useState("");

  async function getToken() {
    const { auth } = getFirebaseClients();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please sign in again.");
    }

    return user.getIdToken();
  }

  // ==========================================
  // SEARCH USERS
  // ==========================================

  async function searchUsers() {
    const query = term.trim();

    setError("");
    setSuccess("");
    setSelected(null);
    setUsers([]);

    if (query.length < 2) {
      setError("Enter at least two characters to search.");
      return;
    }

    setLoadingSearch(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `/api/admin/funding/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "User search failed.");
      }

      setUsers(data.users ?? []);

      if (!data.users?.length) {
        setError("No matching users found.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "User search failed.");
    } finally {
      setLoadingSearch(false);
    }
  }

  // ==========================================
  // SELECT USER AND LOAD WALLET
  // ==========================================

  async function selectUser(user: User) {
    setSelected(user);
    setUsers([]);
    setError("");
    setSuccess("");
    setLoadingWallet(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `/api/admin/funding/wallet?uid=${encodeURIComponent(user.uid)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to load wallet.");
      }

      setBalances(data.balances);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load wallet.");

      setBalances({
        USDT: 0,
        BTC: 0,
        XLM: 0,
        XRP: 0,
      });
    } finally {
      setLoadingWallet(false);
    }
  }

  // ==========================================
  // SUBMIT FUNDING
  // ==========================================

  async function submitFunding() {
    if (!selected || submitting) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await getToken();

      // Reuse the existing key when retrying.
      // Generate a new key only when no pending key exists.
      const idempotencyKey =
        pendingIdempotencyKey || crypto.randomUUID();

      setPendingIdempotencyKey(idempotencyKey);

      const response = await fetch("/api/admin/funding", {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          uid: selected.uid,
          currency,
          amount: amount.trim(),
          note: notes.trim(),
          idempotencyKey,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Funding failed.");
      }

      // The server confirmed success.
      // Clear the pending key only after successful confirmation.
      setPendingIdempotencyKey("");

      setSuccess(
        `${data.amount} ${data.currency} successfully credited. Reference: ${data.transactionId}`
      );

      setAmount("");
      setNotes("");
      setConfirming(false);

      // Refresh the selected wallet after successful funding.
      await selectUser(selected);

    } catch (e) {
      // IMPORTANT:
      // Do not clear pendingIdempotencyKey here.
      // If the server committed the transaction but the browser
      // lost the response, the next retry must reuse the same key.
      setError(e instanceof Error ? e.message : "Funding failed.");

    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // AMOUNT VALIDATION
  // ==========================================

  const parsedAmount = Number(amount);

  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    amount.split(".")[1]?.length <= DECIMALS[currency];

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="mx-auto max-w-[1050px] space-y-5">

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <Wallet size={21} />
        </span>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Account Funding
          </h2>

          <p className="text-sm text-slate-500">
            Credit a user's internal wallet balance.
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <ShieldCheck size={19} className="mt-0.5 shrink-0" />

        <p>
          Administrator-only operation. Funding credits the application's
          internal ledger; it does not send cryptocurrency on-chain.
        </p>
      </div>

      {/* Find User */}
      <section className="dash-card space-y-4 p-5">
        <h3 className="font-bold text-slate-900">
          Find a user
        </h3>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              placeholder="Search by email, username or Firebase UID"
              className="dash-input h-11 w-full pl-10 pr-4 text-sm"
            />
          </div>

          <button
            onClick={searchUsers}
            disabled={loadingSearch}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loadingSearch ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}

            Search
          </button>
        </div>

        {/* Search Results */}
        {users.length > 0 && (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {users.map((user) => (
              <button
                key={user.uid}
                onClick={() => selectUser(user)}
                className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-slate-50"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                  <UserRound size={18} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">
                    {user.firstName} {user.lastName}
                  </span>

                  <span className="block truncate text-xs text-slate-500">
                    @{user.username} · {user.email}
                  </span>
                </span>

                <span className="text-xs font-semibold text-indigo-600">
                  Select
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Selected User */}
      {selected && (
        <>
          <section className="dash-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900">
                Selected account
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selected.status === "suspended"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {selected.status}
              </span>
            </div>

            <div>
              <p className="font-bold text-slate-900">
                {selected.firstName} {selected.lastName}
              </p>

              <p className="text-sm text-slate-500">
                {selected.email}
              </p>

              <p className="text-xs text-slate-400">
                @{selected.username} · UID: {selected.uid}
              </p>
            </div>

            {/* Wallet Balances */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {CURRENCIES.map((code) => (
                <div key={code} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">
                    {code}
                  </p>

                  <p className="mt-1 break-all text-base font-black text-slate-900">
                    {loadingWallet
                      ? "Loading…"
                      : formatBalance(balances[code], code)}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => selected && selectUser(selected)}
              disabled={loadingWallet}
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600"
            >
              <RefreshCw size={13} />
              Refresh balances
            </button>
          </section>

          {/* Add Funds */}
          <section className="dash-card space-y-4 p-5">
            <h3 className="font-bold text-slate-900">
              Add funds
            </h3>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Currency
              </label>

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="dash-input h-11 w-full px-3 text-sm"
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Funding amount
              </label>

              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter ${currency} amount`}
                className="dash-input h-11 w-full px-3 text-sm"
              />

              <p className="mt-1 text-xs text-slate-400">
                Maximum decimal places: {DECIMALS[currency]}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Admin notes (optional)
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Record the reason for this funding"
                className="dash-input w-full resize-y px-3 py-2.5 text-sm"
              />
            </div>

            <button
              onClick={() => setConfirming(true)}
              disabled={
                !validAmount ||
                loadingWallet ||
                selected.status === "suspended" ||
                submitting
              }
              className="dash-submit w-full rounded-xl py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Review funding
            </button>

            {selected.status === "suspended" && (
              <p className="text-sm text-rose-600">
                Funding is disabled for suspended accounts.
              </p>
            )}
          </section>
        </>
      )}

      {/* Funding Confirmation Modal */}
      {confirming && selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm funding
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              You are about to credit:
            </p>

            <div className="my-4 rounded-xl bg-slate-50 p-4 text-sm">
              <p>
                <strong>User:</strong> {selected.email}
              </p>

              <p className="mt-2">
                <strong>Amount:</strong> {amount} {currency}
              </p>

              <p className="mt-2">
                <strong>Current balance:</strong>{" "}
                {formatBalance(balances[currency], currency)} {currency}
              </p>

              {notes && (
                <p className="mt-2 break-words">
                  <strong>Notes:</strong> {notes}
                </p>
              )}
            </div>

            <p className="text-xs text-amber-700">
              This operation changes the internal wallet ledger and creates
              a permanent transaction record.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={submitFunding}
                disabled={submitting}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Confirm funding"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          {success}
        </div>
      )}
    </div>
  );
}