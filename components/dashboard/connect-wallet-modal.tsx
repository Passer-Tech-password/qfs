"use client";

import { useState } from "react";
import { Wallet, X, ArrowRight, CheckCircle2, Maximize2 } from "lucide-react";

type Step = "list" | "import" | "success";
type ImportTab = "phrase" | "keystore" | "privatekey";

type WalletItem = {
  id: string;
  name: string;
  color: string;
  glyph: string;
};

const wallets: WalletItem[] = [
  { id: "metamask", name: "Metamask", color: "bg-orange-500", glyph: "🦊" },
  { id: "trust", name: "Trust", color: "bg-blue-500", glyph: "🛡" },
  { id: "coinbase", name: "Coinbase", color: "bg-blue-600", glyph: "C" },
  { id: "xumm", name: "Xumm", color: "bg-blue-500", glyph: "✕" },
  { id: "cardano", name: "Cardano", color: "bg-blue-700", glyph: "✦" },
  { id: "daedalus", name: "Daedalus", color: "bg-slate-700", glyph: "🐂" },
  { id: "yoroi", name: "Yoroi", color: "bg-blue-500", glyph: "⬢" },
  { id: "ccvault", name: "CCVault", color: "bg-purple-600", glyph: "◆" },
];

export function ConnectWalletModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("list");
  const [selected, setSelected] = useState<WalletItem | null>(null);
  const [tab, setTab] = useState<ImportTab>("phrase");
  const [value, setValue] = useState("");

  if (!open) return null;

  function reset() {
    setStep("list");
    setSelected(null);
    setTab("phrase");
    setValue("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSelect(w: WalletItem) {
    setSelected(w);
    setStep("import");
  }

  function handleValidate() {
    setStep("success");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Outer modal */}
      <div className="relative w-full max-w-[640px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1530] to-[#1a2150] shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600/40 ring-1 ring-indigo-400/40">
              <Wallet size={20} className="text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-white">Connect Web3 Wallet</h3>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40">
                  Secure Bridge
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Multi-Chain Decentralized Protocol &amp; Node Sync
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Expand"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Maximize2 size={16} />
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Brand heading */}
        <div className="px-6 pb-2">
          <h2 className="text-[22px] font-black tracking-tight text-white">
            Credit Coinage
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {step === "list" && (
            <div className="rounded-2xl bg-white p-5 shadow-xl">
              <h4 className="text-[16px] font-bold text-slate-900">Connect to a wallet</h4>
              <div className="mt-4 max-h-[380px] space-y-2 overflow-y-auto pr-1">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleSelect(w)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px] font-bold text-white ${w.color}`}
                    >
                      {w.glyph}
                    </span>
                    <span className="flex-1 text-[15px] font-semibold text-slate-800">
                      {w.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "import" && selected && (
            <div className="rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-[16px] font-bold text-white ${selected.color}`}
                >
                  {selected.glyph}
                </span>
                <h4 className="text-[17px] font-bold text-slate-900">
                  Import your {selected.name} wallet
                </h4>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex gap-6 border-b border-slate-200">
                {(
                  [
                    ["phrase", "Phrase"],
                    ["keystore", "Keystore JSON"],
                    ["privatekey", "Private Key"],
                  ] as [ImportTab, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`-mb-px border-b-2 pb-3 text-[15px] font-semibold transition ${
                      tab === id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="mt-5">
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  rows={4}
                  placeholder={
                    tab === "phrase"
                      ? "Enter your recovery phrase"
                      : tab === "keystore"
                        ? "Paste your Keystore JSON"
                        : "Enter your private key"
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-[14px] text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                />
                <p className="mt-2 text-[12px] text-slate-500">
                  Typically 12 (sometimes 24) words separated by single spaces
                </p>
              </div>

              <button
                type="button"
                onClick={handleValidate}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3.5 text-[15px] font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600"
              >
                Validate
                <ArrowRight size={18} />
              </button>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg bg-red-500 px-5 py-2 text-[13px] font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
              <h4 className="mt-5 text-[22px] font-black text-slate-900">
                Wallet Connected!
              </h4>
              <p className="mt-2 text-[14px] text-slate-500">
                Your wallet has been verified successfully.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[13px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                STATUS: 1 CONNECTED
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-[14px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
