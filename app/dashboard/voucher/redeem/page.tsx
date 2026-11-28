"use client";

import { useRef, useState } from "react";
import { Gift, Check, LoaderCircle, AlertCircle } from "lucide-react";
import {
  postWalletAction,
  type WalletActionResult,
} from "@/lib/firebase/wallet-api";

export default function RedeemVoucherPage() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || success) return;

    const trimmed = code.trim();
    if (!trimmed) {
      setSuccess(null);
      setError("Enter your voucher code.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      idempotencyKeyRef.current ??= crypto.randomUUID();
      const result = await postWalletAction<WalletActionResult>(
        "/api/wallet/voucher/redeem",
        {
          code: trimmed,
          idempotencyKey: idempotencyKeyRef.current,
        },
      );
      idempotencyKeyRef.current = null;
      setSuccess(result.message);
      setCode("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not redeem this voucher. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[520px]">
      <form onSubmit={handleRedeem} className="dash-card p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
          <Gift size={26} className="text-indigo-600" />
        </div>

        <h3 className="mt-5 text-[24px] font-bold text-slate-900">Redeem QFS Voucher</h3>
        <p className="mt-1.5 text-[13px] text-slate-500">
          Enter your 16-digit voucher code below for instant balance credit.
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Voucher Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="E.G.  QFS-XXXXXX-XXXXXX"
            className="dash-input w-full py-4 text-center text-[15px] font-semibold tracking-wider"
          />
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <p className="text-[12.5px] text-rose-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="text-[12.5px] text-emerald-700">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || Boolean(success)}
          className="dash-submit mt-6 w-full rounded-xl py-4 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={17} className="animate-spin" /> Redeeming…
            </span>
          ) : success ? (
            <span className="inline-flex items-center gap-2">
              <Check size={17} /> Redeemed Successfully
            </span>
          ) : (
            "Redeem Code Now"
          )}
        </button>
      </form>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfstier-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
