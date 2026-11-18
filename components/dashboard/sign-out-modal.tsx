"use client";

import { LogOut } from "lucide-react";

export function SignOutModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-[420px] rounded-3xl bg-white p-7 text-center shadow-2xl ring-1 ring-black/5">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-100">
          <LogOut size={26} className="text-rose-500" />
        </div>

        <h3 className="mt-5 text-[18px] font-bold text-slate-900">
          Sign Out of Vault?
        </h3>
        <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-slate-500">
          Are you sure you want to end your current session? You will need your credentials to
          sign back in.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-[13.5px] font-bold text-slate-600 transition hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 py-3 text-[13.5px] font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-105"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
