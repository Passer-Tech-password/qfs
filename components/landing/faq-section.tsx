"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does QFS Assets Vault protect accounts against unauthorized access?",
    a: "QFS enforces layered protection: biometric WebAuthn passkeys bound to your device, a 4-digit security PIN for high-risk operations, 256-bit quantum encryption at rest, and multi-signature hardware MPC for vault withdrawals. All sessions are monitored for anomalous access patterns with instant freeze controls.",
  },
  {
    q: "Which cryptocurrencies are supported for instant transfer?",
    a: "Instant transfers are supported across Stellar (XLM), Ripple (XRP), Bitcoin (BTC), and Tether (USDT). Cross-chain swaps settle sub-second via the QFS liquidity bridge with zero counterparty friction.",
  },
  {
    q: "How do transfers between enrolled vault members work?",
    a: "Enrolled members can send assets to one another using a vault ID or registered email. Transfers are settled instantly on the QFS ledger, recorded with ISO 20022-compliant metadata, and require the sender's biometric confirmation. No third-party intermediary is involved.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-white/5 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[900px]">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-cyan-300">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-cyan-400/20 text-[9px]">?</span>
            KNOWLEDGE BASE
          </span>
          <h2 className="mt-6 text-[30px] font-black leading-[1.1] tracking-tight text-white sm:text-[40px]">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-[14px] leading-[1.7] text-slate-400">
            Learn more about quantum access controls and ledger operations.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1120]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.02]"
                >
                  <span className="text-[15px] font-bold text-white sm:text-[16px]">{item.q}</span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-[13px] leading-[1.7] text-slate-400">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
