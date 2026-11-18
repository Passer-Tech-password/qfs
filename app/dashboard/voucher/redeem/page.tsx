"use client";

import { useState } from "react";
import { Gift, Check } from "lucide-react";

export default function RedeemVoucherPage() {
  const [code, setCode] = useState("");
  const [redeemed, setRedeemed] = useState(false);

  function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setRedeemed(true);
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

        <button
          type="submit"
          className="dash-submit mt-6 w-full rounded-xl py-4 text-[15px] font-bold"
        >
          {redeemed ? (
            <span className="inline-flex items-center gap-2">
              <Check size={17} /> Redeemed Successfully
            </span>
          ) : (
            "Redeem Code Now"
          )}
        </button>
      </form>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Quantum Finance. All rights reserved.
      </footer>
    </div>
  );
}
