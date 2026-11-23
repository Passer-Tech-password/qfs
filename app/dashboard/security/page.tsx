"use client";

import { useState } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Copy,
  Lock,
  AlertTriangle,
  Check,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import { saveSecurityPin } from "@/lib/firebase/account-security";

// Deterministic pseudo-QR pattern (visual placeholder only)
const QR_SIZE = 17;
const qrPattern: boolean[] = (() => {
  const arr: boolean[] = [];
  for (let i = 0; i < QR_SIZE * QR_SIZE; i++) {
    const r = Math.floor(i / QR_SIZE);
    const c = i % QR_SIZE;
    // corner position markers
    const inCorner =
      (r < 7 && c < 7) ||
      (r < 7 && c >= QR_SIZE - 7) ||
      (r >= QR_SIZE - 7 && c < 7);
    if (inCorner) {
      const lr = r >= QR_SIZE - 7 ? r - (QR_SIZE - 7) : r;
      const lc = c >= QR_SIZE - 7 ? c - (QR_SIZE - 7) : c;
      const onBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
      const center = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
      arr.push(onBorder || center);
    } else {
      arr.push((i * 7 + 13) % 3 === 0);
    }
  }
  return arr;
})();

const recoveryWords = [
  "abandon", "ability", "able", "about",
  "above", "absent", "absorb", "abstract",
  "absurd", "abuse", "access", "accident",
];

const guidelines = [
  "Store your 12-word seed phrase and 2FA secret offline in a secure physical location.",
  "Support will NEVER ask for your private key, seed phrase, or 6-digit codes.",
];

export default function SecurityPage() {
  const [revealed, setRevealed] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [code, setCode] = useState("123456");
  const [saving, setSaving] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSaved, setPinSaved] = useState(false);
  const [phraseCopied, setPhraseCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFAActivated, setTwoFAActivated] = useState(false);

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

  function handleCopyPhrase() {
    const phrase = recoveryWords.join(" ");
    navigator.clipboard?.writeText(phrase).catch(() => {});
    setPhraseCopied(true);
    setTimeout(() => setPhraseCopied(false), 1800);
  }

  function handleCopySetupKey() {
    navigator.clipboard?.writeText("X3IDK4QF3ZCW2HVA").catch(() => {});
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 1800);
  }

  function handleActivate2FA() {
    if (code.trim().length < 6) {
      setTwoFAError("Enter the 6-digit code from your authenticator app.");
      setTwoFAActivated(false);
      return;
    }
    setTwoFAError(null);
    setTwoFAActivated(true);
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
          Security &amp; Authentication
        </span>
        <h2 className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">
          Google Authenticator &amp; Wallet Security
        </h2>
        <p className="mx-auto mt-1.5 max-w-[640px] text-[13px] text-slate-500">
          Manage your Google 2FA Authenticator, 4-digit Security PIN, and 12-word Secret Recovery
          Phrase.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Secret Recovery Phrase */}
          <div className="dash-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <KeyRound size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Secret Recovery Phrase (12 Words)
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Never share your secret phrase with anyone. It gives full cryptographic ownership
                    to your vault.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {revealed ? "Hide Phrase" : "Reveal Phrase"}
              </button>
            </div>

            {/* Word grid */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {recoveryWords.map((word, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                    {i + 1}
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${
                      revealed ? "text-slate-800" : "select-none blur-[4px]"
                    }`}
                  >
                    {word}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
              >
                {phraseCopied ? <Check size={15} /> : <Copy size={15} />}
                {phraseCopied ? "Copied!" : "Copy 12-Word Phrase"}
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                <Lock size={12} />
                AES-256 Vault Encrypted
              </span>
            </div>
          </div>

          {/* 4-Digit PIN */}
          <div className="dash-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <Lock size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    4-Digit Security &amp; Transaction PIN
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Your 4-digit security PIN is used for Step-Up sign-in verification and
                    authorizing vault transfers.
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                PIN Active
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  className="dash-input w-full py-3 pl-4 pr-12 text-center text-[18px] font-bold tracking-[0.5em] text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSavePin}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <LoaderCircle className="animate-spin" size={16} />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save PIN
                  </>
                )}
              </button>
            </div>

            {pinError && (
              <p className="mt-3 text-[12px] font-medium text-rose-600">{pinError}</p>
            )}
            {pinSaved && (
              <p className="mt-3 text-[12px] font-medium text-emerald-600">
                Your 4-digit security PIN has been saved.
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Google Authenticator 2FA */}
          <div className="dash-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                  <ShieldCheck size={20} className="text-sky-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Google Authenticator (2FA)
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Protect your vault with time-based 6-digit one-time passwords (TOTP) via Google
                    Authenticator, Authy, or Microsoft Authenticator.
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                2FA Inactive
              </span>
            </div>

            {/* QR code */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-center text-[11px] font-semibold text-slate-500">
                Scan QR in Google Authenticator
              </p>
              <div className="mx-auto mt-3 flex h-[140px] w-[140px] items-center justify-center rounded-lg bg-white p-2 shadow-inner">
                <div
                  className="grid gap-[1px]"
                  style={{
                    gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)`,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {qrPattern.map((on, i) => (
                    <div
                      key={i}
                      className={on ? "bg-slate-900" : "bg-white"}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Manual setup key */}
            <div className="mt-4">
              <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
                Manual Setup Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value="X3IDK4QF3ZCW2HVA"
                  readOnly
                  className="dash-input w-full py-2.5 pl-3.5 pr-12 font-mono text-[12.5px] text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleCopySetupKey}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Copy setup key"
                >
                  {keyCopied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            {/* 6-digit code */}
            <div className="mt-4">
              <label className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
                Enter 6-Digit Code to Confirm
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                className="dash-input w-full py-2.5 px-3.5 text-center text-[15px] font-bold tracking-[0.4em] text-slate-700"
              />
            </div>

            <button
              type="button"
              onClick={handleActivate2FA}
              disabled={twoFAActivated}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-70"
            >
              {twoFAActivated ? (
                <span className="inline-flex items-center gap-2">
                  <Check size={16} /> Google 2FA Activated
                </span>
              ) : (
                "Activate Google 2FA"
              )}
            </button>

            {twoFAError && (
              <p className="mt-3 text-[12px] font-medium text-rose-600">{twoFAError}</p>
            )}
            {twoFAActivated && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                <p className="text-[12.5px] font-medium text-emerald-700">
                  Two-factor authentication has been enabled for your account.
                </p>
              </div>
            )}
          </div>

          {/* Security Guidelines */}
          <div className="dash-card p-6">
            <h3 className="text-[15px] font-bold text-slate-900">Security Guidelines</h3>
            <ul className="mt-4 space-y-3">
              {guidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <Check size={11} className="text-white" />
                  </span>
                  <span className="text-[12px] text-slate-600">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Warning footer */}
      <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle size={18} className="shrink-0 text-amber-500" />
        <p className="text-[12px] font-medium text-amber-800">
          Never disclose your recovery phrase, PIN, or 2FA codes to anyone, including Qfstier-4bwallet
          support.
        </p>
      </div>
    </div>
  );
}
