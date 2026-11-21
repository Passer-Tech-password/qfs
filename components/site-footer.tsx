import Link from "next/link";
import { Shield, Lock, ChevronRight, Check } from "lucide-react";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1b2232] bg-[#080c16] px-5 py-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" aria-label="Quantum Finance home">
              <Brand compact />
            </Link>
            <p className="mt-4 max-w-[340px] text-[13px] leading-relaxed text-slate-500">
              Next-generation institutional digital asset custody and sovereign asset ledger
              compliant with ISO 20022 messaging schemas, FIDO2 biometric passkeys, and
              multi-signature cold vaults.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-quantum-blink" />
              QFS Mainnet 100% Operational
            </span>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-white">
              <ChevronRight size={14} className="text-cyan-400" /> Navigation
            </h4>
            <ul className="mt-4 space-y-3 text-[13px]">
              <li>
                <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-white">
                  <ChevronRight size={13} className="text-slate-600" /> Home Platform
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-white">
                  <ChevronRight size={13} className="text-slate-600" /> About QFS Vault
                </Link>
              </li>
              <li>
                <Link href="/whitepaper" className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-white">
                  <ChevronRight size={13} className="text-slate-600" /> ISO 20022 Whitepapers
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h4 className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-white">
              <Shield size={14} className="text-violet-400" /> Security &amp; Access
            </h4>
            <ul className="mt-4 space-y-3 text-[13px]">
              <li>
                <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-white">
                  <ChevronRight size={13} className="text-slate-600" /> Member Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-white">
                  <ChevronRight size={13} className="text-slate-600" /> Create Vault Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-white">
                  <ChevronRight size={13} className="text-slate-600" /> Recover Account PIN
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <Check size={14} /> 256-Bit Encrypted Ledger
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#1b2232] pt-6 sm:flex-row">
          <p className="text-[12px] text-slate-600">
            © 2026 <span className="font-semibold text-slate-400">Quantum Finance</span>. All
            rights reserved. Sovereign Digital Custody.
          </p>
          <div className="flex items-center gap-4 text-[12px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <Shield size={13} /> ISO 20022 Certified
            </span>
            <span className="inline-flex items-center gap-1.5 text-violet-400">
              <Lock size={13} /> FIDO2 Passkey Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
