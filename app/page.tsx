import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Fingerprint,
  WalletCards,
  Zap,
  CreditCard,
  CircleDot,
  Lock,
  Crown,
  MessageCircle,
  Cpu,
  Bot,
  Building2,
  TrendingUp,
  Check,
  BookmarkPlus,
  Bitcoin,
  Coins,
  Diamond,
  Receipt,
  Fingerprint as FingerprintIcon,
  Sparkles,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FaqSection } from "@/components/landing/faq-section";

const ledgerAssets = [
  { name: "Stellar (XLM)", value: "Instant", sub: "Stellar Network", color: "text-purple-300" },
  { name: "Ripple (XRP)", value: "Synchronized", sub: "XRP Ledger", color: "text-cyan-300" },
  { name: "Bitcoin (BTC)", value: "Cold Vault", sub: "Multi-Sig MPC", color: "text-amber-300" },
  { name: "Tether (USDT)", value: "Liquid 1:1", sub: "TRC20 / ERC20", color: "text-emerald-300" },
];

const stats = [
  { value: "$3.84B+", label: "Secured Vault Volume" },
  { value: "3,850,000+", label: "Active Vault Holders" },
  { value: "18,400+", label: "Humanitarian Projects" },
  { value: "100%", label: "ISO 20022 Certified" },
];

const infraFeatures = [
  {
    icon: Fingerprint,
    bg: "from-purple-600 to-purple-500",
    title: "Biometric WebAuthn Passkeys",
    text: "Hardware-bound biometric multi-factor authentication (TouchID, FaceID, Security Keys) preventing phishing, unauthorized access, and credential theft.",
    checks: ["4-Digit Security PIN 2FA", "FIDO2 / WebAuthn Certified"],
  },
  {
    icon: Cpu,
    bg: "from-cyan-500 to-blue-500",
    title: "ISO 20022 Ledger Protocol",
    text: "High-speed settlement across Stellar (XLM), Ripple (XRP), and major digital assets with standard structured payment metadata and sub-second confirmations.",
    checks: ["Stellar XLM Native Liquidity", "TRC20, ERC20 & BEP20 Support"],
  },
  {
    icon: CreditCard,
    bg: "from-amber-500 to-orange-500",
    title: "QFS 24KT Gold Virtual Cards",
    text: "Spend your digital assets worldwide with custom spending limits, instant freeze controls, and Visa/Mastercard/Amex compatibility.",
    checks: ["Instant Virtual Issuance", "Up to $100,000/day Limit"],
  },
];

const cardTiers = [
  { badge: "24K", title: "QFS 24KT Gold Card", sub: "Sovereign luxury bullion tier", limit: "$100k/day" },
  { badge: "VISA", title: "Visa Infinite Vault", sub: "Global ATM & POS acceptance", limit: "$25k/day" },
  { badge: "MC", title: "World Elite Mastercard", sub: "Zero FX surcharge & multi-asset", limit: "$50k/day" },
  { badge: "AMEX", title: "American Express VIP", sub: "Travel privileges & concierge", limit: "$40k/day" },
];

const cardFeatures = [
  "Auto-debit from USDT, BTC, ETH, XLM & XRP",
  "Apple Pay & Google Pay mobile NFC sync",
  "0% Foreign exchange surcharge worldwide",
  "Custom ATM PIN & 1-click card freeze control",
];

const smartCardPills = [
  { icon: Shield, text: "Zero foreign exchange conversion surcharges worldwide" },
  { icon: Zap, text: "Real-time automatic balance auto-debit from selected crypto" },
  { icon: FingerprintIcon, text: "4-digit security PIN and biometric WebAuthn verification" },
];

const newsCards = [
  {
    tag: "QFS PROTOCOL",
    tagColor: "bg-purple-500/15 text-purple-300",
    time: "15 mins ago",
    title: "Quantum Ledger v4.8 Mainnet Settlement Engine Fully Synchronized",
    text: "Core validator nodes have completed the zero-latency inter-bank liquidity bridge. Sub-second atomic swaps across Stellar XLM and Ripple XRP verified with 100% cryptographic consensus.",
    authorInitial: "Q",
    author: "QFS Reserve Board",
    authorColor: "bg-cyan-500/20 text-cyan-300",
    linkColor: "text-cyan-300 hover:text-cyan-200",
  },
  {
    tag: "ISO 20022",
    tagColor: "bg-violet-500/15 text-violet-300",
    time: "2 hours ago",
    title: "Global Interbank pacs.008 Messaging Architecture Standard Enforced",
    text: "Financial institutions and sovereign vaults have adopted unified XML schemas for real-time cross-border settlements with zero counterparty friction.",
    authorInitial: "ISO",
    author: "Standards Committee",
    authorColor: "bg-violet-500/20 text-violet-300",
    linkColor: "text-violet-300 hover:text-violet-200",
  },
  {
    tag: "MARKET INSIGHT",
    tagColor: "bg-emerald-500/15 text-emerald-300",
    time: "5 hours ago",
    title: "Institutional Vault Reserves Cross $3.84 Billion in Total Assets",
    text: "Sovereign member registrations and multi-asset vault lock-ins surge as institutional participants migrate liquidity into quantum-encrypted cold storage facilities.",
    authorInitial: "M",
    author: "Global Markets Desk",
    authorColor: "bg-emerald-500/20 text-emerald-300",
    linkColor: "text-cyan-300 hover:text-cyan-200",
  },
];

export default function HomePage() {
  return (
    <main className="bg-[#040711] text-slate-200">
      <SiteHeader />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1000px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-cyan-300">
            <CircleDot size={12} className="text-cyan-300" />
            QUANTUM FINANCIAL SYSTEM • ISO 20022 COMPLIANT
          </span>

          <h1 className="mx-auto mt-7 max-w-[920px] text-[40px] font-black leading-[1.06] tracking-[-0.03em] text-white sm:text-[58px] md:text-[70px]">
            Quantum Financial{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Backup
            </span>{" "}
            &amp; Technology
          </h1>

          <p className="mx-auto mt-6 max-w-[760px] text-[14px] leading-[1.7] text-slate-400 sm:text-[16px]">
            Experience next-generation quantum-resistant security, ISO 20022 cross-ledger
            messaging, biometric passkeys, and multi-asset vault management for Stellar (XLM),
            Ripple (XRP), Bitcoin, and digital currencies.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-7 text-[14px] font-bold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 sm:w-auto"
            >
              Open Quantum Vault <ArrowRight size={16} />
            </Link>
            <Link
              href="#ecosystem"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-7 text-[14px] font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              <Building2 size={16} /> Ecosystem Intelligence
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== SOVEREIGN ASSET LEDGER ===================== */}
      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto max-w-[1080px]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0c1120] shadow-2xl animate-shake">
            {/* Ledger header */}
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                  <Shield size={22} />
                </span>
                <div>
                  <h2 className="text-[17px] font-bold text-white sm:text-[19px]">
                    QFS Sovereign Asset Ledger
                  </h2>
                  <p className="mt-0.5 text-[12px] text-slate-400">
                    <span className="font-semibold text-slate-500">Node ID:</span>{" "}
                    <span className="font-mono text-cyan-300">QFS-NODE-7849</span>{" "}
                    <span className="mx-1.5 text-slate-600">•</span>{" "}
                    <span className="font-semibold text-slate-500">Status:</span>{" "}
                    <span className="font-semibold text-emerald-400">Verified Online</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-300">
                  <Lock size={12} /> 256-Bit Quantum Encrypted
                </span>
                <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-[11px] font-bold text-violet-300">
                  ISO 20022
                </span>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Asset grid */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
              {ledgerAssets.map((asset) => (
                <div
                  key={asset.name}
                  className="rounded-2xl border border-white/5 bg-[#121829] p-5 text-center transition hover:border-white/10"
                >
                  <p className="text-[13px] font-semibold text-slate-300">{asset.name}</p>
                  <p className={`mt-2 text-[20px] font-black ${asset.color}`}>{asset.value}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{asset.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-[34px] font-black tracking-tight text-white sm:text-[42px]">
                  <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                    {s.value}
                  </span>
                </p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== NEXT-GEN INFRASTRUCTURE ===================== */}
      <section id="ecosystem" className="border-t border-white/5 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1180px]">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-cyan-300">
              <Bot size={12} />
              NEXT-GEN INFRASTRUCTURE
            </span>
            <h2 className="mx-auto mt-6 max-w-[760px] text-[32px] font-black leading-[1.1] tracking-tight text-white sm:text-[42px]">
              Pioneering the Future of Sovereign Finance
            </h2>
            <p className="mx-auto mt-4 max-w-[680px] text-[14px] leading-[1.7] text-slate-400 sm:text-[15px]">
              Engineered with quantum-proof access safeguards, multi-asset compatibility, and
              high-yield fixed asset vaults.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {infraFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <article
                  key={f.title}
                  className="rounded-3xl border border-white/10 bg-[#0c1120] p-7 transition hover:border-white/20"
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${f.bg} text-white shadow-lg`}
                  >
                    <Icon aria-hidden="true" size={26} />
                  </span>
                  <h3 className="mt-5 text-[19px] font-bold text-white">{f.title}</h3>
                  <p className="mt-3 text-[13px] leading-[1.7] text-slate-400">{f.text}</p>
                  <ul className="mt-5 space-y-2.5">
                    {f.checks.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-[13px] font-medium text-slate-300">
                        <Check size={15} className="text-cyan-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== SOVEREIGN SMART CARDS ===================== */}
      <section className="border-t border-white/5 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1180px]">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-amber-300">
              <Crown size={12} />
              SOVEREIGN SMART CARDS
            </span>
            <h2 className="mx-auto mt-6 max-w-[760px] text-[32px] font-black leading-[1.1] tracking-tight text-white sm:text-[42px]">
              Quantum Multi-Network Smart Cards
            </h2>
            <p className="mx-auto mt-4 max-w-[680px] text-[14px] leading-[1.7] text-slate-400 sm:text-[15px]">
              Spend digital assets worldwide with instant auto-debit conversion, zero exchange
              surcharges, and Apple/Google Pay contactless sync.
            </p>
          </div>

          {/* Feature pills */}
          <div className="mx-auto mt-12 grid max-w-[1100px] gap-4 sm:grid-cols-3">
            {smartCardPills.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.text}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1120] px-4 py-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
                    <Icon size={16} />
                  </span>
                  <p className="text-[12.5px] font-medium text-slate-300">{p.text}</p>
                </div>
              );
            })}
          </div>

          {/* Card network section */}
          <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            {/* Left: card preview */}
            <div>
              <div className="flex flex-wrap gap-2">
                {["24K Gold", "Visa", "Mastercard", "Amex"].map((t, i) => (
                  <button
                    key={t}
                    className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                      i === 0
                        ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                        : "bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {i === 0 && <Sparkles size={12} className="mr-1 inline" />}
                    {t}
                  </button>
                ))}
              </div>

              <div className="relative mt-6 aspect-[1.6/1] w-full max-w-[460px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#facc15] via-[#d97706] to-[#92400e] p-6 shadow-2xl shadow-amber-900/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-950/70">
                      Quantum Financial System
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-amber-950/60">
                      24K • 999.9 FINE GOLD
                    </p>
                  </div>
                  <span className="rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-extrabold text-amber-200">
                    24KT GOLD
                  </span>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <div className="grid h-8 w-11 grid-cols-3 grid-rows-3 gap-0.5 rounded-md bg-gradient-to-br from-yellow-200 to-amber-400 p-1">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="rounded-[1px] bg-amber-700/40" />
                    ))}
                  </div>
                  <span className="text-amber-950/70">))</span>
                </div>

                <p className="mt-5 text-[20px] font-black tracking-[0.15em] text-amber-950">
                  9 9 9 9 •••• •••• 8 8 2 1
                </p>

                <div className="mt-6 flex items-end justify-between text-amber-950">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider opacity-70">
                      Card Holder
                    </p>
                    <p className="text-[12px] font-bold">SOVEREIGN MEMBER</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider opacity-70">
                      Expires
                    </p>
                    <p className="text-[12px] font-bold">12/28</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider opacity-70">
                      Daily Limit
                    </p>
                    <p className="text-[12px] font-bold">$100,000</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-[12px] font-semibold text-amber-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Instant Virtual Issuance
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 size={14} /> Worldwide POS &amp; ATM
                </span>
              </div>
            </div>

            {/* Right: tiers + features */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-white">
                  <CreditCard size={18} className="text-cyan-300" />
                  SUPPORTED CARD NETWORKS &amp; TIERS
                </h3>
                <span className="text-[11px] text-slate-500">Click any tier to preview</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {cardTiers.map((t) => (
                  <div
                    key={t.title}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1120] p-4 transition hover:border-white/20"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-[11px] font-black text-white">
                      {t.badge}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-white">{t.title}</p>
                      <p className="truncate text-[11px] text-slate-500">{t.sub}</p>
                    </div>
                    <span className="text-[12px] font-bold text-cyan-300">{t.limit}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mt-5 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-indigo-950/40 p-5">
                <h4 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-cyan-300">
                  Smart Card Operational Features
                </h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {cardFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                      <span className="text-[12.5px] text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-violet-500 px-6 text-[14px] font-bold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110"
                >
                  <CreditCard size={16} /> Apply for Quantum Card <ArrowRight size={15} />
                </Link>
                <span className="text-[12px] text-slate-500">
                  Instant virtual activation upon account verification
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ECOSYSTEM BULLETINS & NEWS ===================== */}
      <section className="border-t border-white/5 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                LIVE NETWORK INTELLIGENCE
              </span>
              <h2 className="mt-5 text-[30px] font-black leading-[1.1] tracking-tight text-white sm:text-[40px]">
                Ecosystem Bulletins &amp; Market News
              </h2>
              <p className="mt-3 max-w-[640px] text-[14px] leading-[1.7] text-slate-400">
                Verified institutional announcements, QFS protocol milestones, and global digital
                asset regulatory updates.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["All Intelligence", "QFS Protocols", "ISO 20022", "Market Insights"].map(
                (t, i) => (
                  <button
                    key={t}
                    className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                      i === 0
                        ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30"
                        : "bg-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {newsCards.map((n) => (
              <article
                key={n.title}
                className="group flex flex-col rounded-3xl border border-white/10 bg-[#0c1120] p-6 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${n.tagColor}`}
                  >
                    {n.tag}
                  </span>
                  <span className="text-[11px] text-slate-500">{n.time}</span>
                </div>
                <h3 className="mt-4 text-[17px] font-bold leading-snug text-white">
                  {n.title}
                </h3>
                <p className="mt-3 flex-1 text-[12.5px] leading-[1.7] text-slate-400">{n.text}</p>
                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-extrabold ${n.authorColor}`}>
                      {n.authorInitial}
                    </span>
                    <span className="text-[12px] font-medium text-slate-300">{n.author}</span>
                  </div>
                  <button className={`inline-flex items-center gap-1.5 text-[12px] font-bold transition ${n.linkColor}`}>
                    Read Bulletin <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <FaqSection />

      {/* ===================== FINAL CTA ===================== */}
      <section className="border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[1100px] rounded-3xl bg-gradient-to-br from-[#1a1442] via-[#1e1b4b] to-[#2a1b6b] p-10 text-center shadow-2xl ring-1 ring-violet-500/20 sm:p-14">
          <h2 className="mx-auto max-w-[700px] text-[28px] font-extrabold tracking-tight text-white sm:text-[36px]">
            Ready to Secure Your Digital Assets?
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-[14px] leading-relaxed text-violet-100 sm:text-[15px]">
            Join over 3.85 million enrolled members worldwide. Register in under 60 seconds and
            experience institutional sovereign custody.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 text-[14px] font-bold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 sm:w-auto"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 text-[14px] font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Sign In to Vault
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
