"use client";

import { useState } from "react";
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
  Bell,
  Mail,
  Wallet,
  Newspaper,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  KeyRound,
  Check,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { saveSecurityPin } from "@/lib/firebase/account-security";

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
      on ? "bg-indigo-600" : "bg-slate-300"
    }`}
    >
      <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
        on ? "translate-x-5" : "translate-x-0.5"
      }`}
    />
  </span>
  );
}

const notifCards = [
  {
    icon: Mail,
    title: "Email Notifications",
    desc: "Important account updates.",
    active: true,
  },
  {
    icon: Wallet,
    title: "Transaction Alerts",
    desc: "Real-time alert on every transfer.",
    active: true,
  },
  {
    icon: Newspaper,
    title: "Vault & API News",
    desc: "Staking rate changes & news.",
    active: true,
  },
];

export default function SettingsPage() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFaOn, setTwoFaOn] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [notifs, setNotifs] = useState(notifCards.map((c) => c.active));
  const [saving, setSaving] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSaved, setPinSaved] = useState(false);

  async function handleSavePin() {
    if (saving) return;
    setPinError(null);
    setPinSaved(false);
    setSaving(true);
    try {
      await saveSecurityPin(pin);
      setPinSaved(true);
    } catch (err) {
      setPinError(
        err instanceof Error ? err.message : "Could not save your PIN. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1080px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Account Preferences
          </span>
          <h2 className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">
            Account Settings
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage your security credentials, 4-digit PIN, 2FA, and notification preferences.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Dashboard
        </Link>
      </div>

      {/* Top row: Change Password + 2FA & PIN */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Change Password */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100">
              <Lock size={18} className="text-rose-600" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">Change Password</h3>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="dash-input w-full py-3 pl-4 pr-11 text-[13.5px]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  className="dash-input w-full py-3 pl-4 pr-11 text-[13.5px]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Strength bars */}
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      newPw.length > i * 2 ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  className="dash-input w-full py-3 pl-4 pr-11 text-[13.5px]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="dash-submit mt-6 w-full rounded-xl py-3 text-[14px] font-bold"
          >
            Update Password
          </button>
        </div>

        {/* Two-Factor Authentication & PIN */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
              <Shield size={18} className="text-amber-600" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">
              Two-Factor Authentication &amp; PIN
            </h3>
          </div>

          {/* 2FA Status */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
            <div>
              <p className="text-[12.5px] font-bold text-slate-800">
                2FA Status: {twoFaOn ? "ENABLED" : "DISABLED"}
              </p>
              <p className="text-[11px] text-slate-500">
                When active, your 4-digit Security PIN is required upon every sign-in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTwoFaOn((v) => !v)}
              aria-label="Toggle 2FA"
            >
              <Toggle on={twoFaOn} />
            </button>
          </div>

          {/* 4-Digit Security PIN */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-indigo-600" />
                <span className="text-[13px] font-bold text-slate-800">
                  4-Digit Security PIN
                </span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                PIN Set
              </span>
            </div>
            <p className="mt-1.5 text-[11.5px] text-slate-500">
              This 4-digit code (created during registration) is used as your Two-Factor
              Authentication verification code.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  className="dash-input w-full py-2.5 pl-4 pr-10 text-center text-[15px] font-bold tracking-[0.4em] text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSavePin}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-[12.5px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <LoaderCircle className="animate-spin" size={15} />
                    Saving…
                  </>
                ) : (
                  "Save PIN"
                )}
              </button>
            </div>

            {pinError && (
              <p className="mt-2.5 text-[11.5px] font-medium text-rose-600">{pinError}</p>
            )}
            {pinSaved && (
              <p className="mt-2.5 text-[11.5px] font-medium text-emerald-600">
                Your 4-digit security PIN has been saved.
              </p>
            )}
          </div>

          {/* Google 2FA & Security link */}
          <Link
            href="/dashboard/security"
            className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:bg-slate-50"
          >
            <Shield size={17} className="text-sky-600" />
            <span className="flex-1 text-[13px] font-semibold text-slate-700">
              Google 2FA &amp; Security
            </span>
            <ChevronRight size={17} className="text-slate-400" />
          </Link>

          {/* KYC Identity Verification link */}
          <Link
            href="/dashboard/kyc"
            className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 transition hover:bg-slate-50"
          >
            <Shield size={17} className="text-violet-600" />
            <span className="flex-1 text-[13px] font-semibold text-slate-700">
              KYC Identity Verification
            </span>
            <ChevronRight size={17} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="dash-card mt-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100">
              <Bell size={18} className="text-sky-600" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">
              Notification Preferences
            </h3>
          </div>
          <p className="text-[11.5px] text-slate-400">Click any switch to toggle on / off</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {notifCards.map((n, i) => {
            const Icon = n.icon;
            return (
              <div
                key={n.title}
                className={`rounded-xl border p-4 transition ${
                  notifs[i]
                    ? "border-indigo-200 bg-indigo-50/50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={18} className="text-indigo-600" />
                  <button
                    type="button"
                    onClick={() =>
                      setNotifs((prev) =>
                        prev.map((v, idx) => (idx === i ? !v : v)),
                      )
                    }
                    aria-label={`Toggle ${n.title}`}
                  >
                    <Toggle on={notifs[i]} />
                  </button>
                </div>
                <p className="mt-3 text-[13px] font-bold text-slate-800">{n.title}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500">{n.desc}</p>
                {notifs[i] && (
                  <span className="mt-3 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
          >
            <Check size={16} />
            Save All Preferences
          </button>
          <p className="text-[11px] text-slate-400">Auto-saves on switch toggle</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="dash-card mt-6 border-rose-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100">
              <AlertTriangle size={18} className="text-rose-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-rose-600">Danger Zone</h3>
              <p className="mt-1 text-[13px] font-semibold text-slate-800">
                Close / Delete Account
              </p>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Permanently remove your account and cryptographic authorizations. This action is
                irreversible.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-[12.5px] font-bold text-rose-600 transition hover:bg-rose-100"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
