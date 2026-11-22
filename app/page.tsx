"use client";

import { useState } from "react";
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
  X,
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
  {
    tab: "24K Gold",
    badge: "24K",
    title: "QFS 24KT Gold Card",
    sub: "Sovereign luxury bullion tier",
    limit: "$100k/day",
    preview: {
      gradient: "from-[#facc15] via-[#d97706] to-[#92400e]",
      glow: "shadow-amber-900/30",
      ink: "text-amber-950",
      badge: "bg-black/70 text-amber-200",
      topLabel: "24K • 999.9 FINE GOLD",
      chip: "from-yellow-200 to-amber-400",
      chipCell: "bg-amber-700/40",
      number: "9 9 9 9 •••• •••• 8 8 2 1",
      network: "24KT GOLD",
      expires: "12/28",
      dailyLimit: "$100,000",
    },
  },
  {
    tab: "Visa",
    badge: "VISA",
    title: "Visa Infinite Vault",
    sub: "Global ATM & POS acceptance",
    limit: "$25k/day",
    preview: {
      gradient: "from-[#1e40af] via-[#1d4ed8] to-[#0b1220]",
      glow: "shadow-blue-900/40",
      ink: "text-blue-50",
      badge: "bg-black/70 text-blue-200",
      topLabel: "VISA INFINITE • SIGNATURE",
      chip: "from-slate-200 to-blue-300",
      chipCell: "bg-blue-900/40",
      number: "4 1 0 0 •••• •••• 2 5 0 9",
      network: "VISA",
      expires: "09/29",
      dailyLimit: "$25,000",
    },
  },
  {
    tab: "Mastercard",
    badge: "MC",
    title: "World Elite Mastercard",
    sub: "Zero FX surcharge & multi-asset",
    limit: "$50k/day",
    preview: {
      gradient: "from-[#b91c1c] via-[#dc2626] to-[#450a0a]",
      glow: "shadow-red-900/40",
      ink: "text-red-50",
      badge: "bg-black/70 text-red-200",
      topLabel: "WORLD ELITE • MULTI-ASSET",
      chip: "from-amber-200 to-yellow-400",
      chipCell: "bg-red-900/40",
      number: "5 4 2 1 •••• •••• 7 3 4 0",
      network: "MASTERCARD",
      expires: "03/30",
      dailyLimit: "$50,000",
    },
  },
  {
    tab: "Amex",
    badge: "AMEX",
    title: "American Express VIP",
    sub: "Travel privileges & concierge",
    limit: "$40k/day",
    preview: {
      gradient: "from-[#0f766e] via-[#0d9488] to-[#042f2e]",
      glow: "shadow-teal-900/40",
      ink: "text-teal-50",
      badge: "bg-black/70 text-teal-200",
      topLabel: "AMEX VIP • TRAVEL EDITION",
      chip: "from-slate-200 to-teal-300",
      chipCell: "bg-teal-900/40",
      number: "3 7 8 2 •••• •••• 9 1 6 5",
      network: "AMEX",
      expires: "06/30",
      dailyLimit: "$40,000",
    },
  },
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
    category: "qfs",
    tagColor: "bg-purple-500/15 text-purple-300",
    time: "15 mins ago",
    title: "Quantum Ledger v4.8 Mainnet Settlement Engine Fully Synchronized",
    text: "Core validator nodes have completed the zero-latency inter-bank liquidity bridge. Sub-second atomic swaps across Stellar XLM and Ripple XRP verified with 100% cryptographic consensus.",
    authorInitial: "Q",
    author: "QFS Reserve Board",
    authorColor: "bg-cyan-500/20 text-cyan-300",
    linkColor: "text-cyan-300 hover:text-cyan-200",
    bulletinBadge: "QFS PROTOCOL MILESTONE",
    bulletinByline: "Published by QFS Global Reserve Board",
    bulletinBody: [
      "GENEVA & ZURICH — The Quantum Financial System (QFS) architectural core committee has officially certified the completion and activation of the v4.8 Mainnet Settlement Engine.",
      "This deployment establishes native, quantum-resistant communication across sovereign multi-asset ledgers, enabling instant cross-border transfers for Stellar (XLM), Ripple (XRP), Bitcoin, Ethereum, and Tether (USDT).",
    ],
    bulletinBulletsTitle: "Key Technical Enhancements in v4.8:",
    bulletinBullets: [
      "Zero-latency atomic swaps with 100% cryptographic reserve validation.",
      "FIDO2/WebAuthn hardware key biometric settlement triggers.",
      "Direct compatibility with the ISO 20022 pacs.008 customer credit transfer schema.",
    ],
  },
  {
    tag: "ISO 20022",
    category: "iso",
    tagColor: "bg-violet-500/15 text-violet-300",
    time: "2 hours ago",
    title: "Global Interbank pacs.008 Messaging Architecture Standard Enforced",
    text: "Financial institutions and sovereign vaults have adopted unified XML schemas for real-time cross-border settlements with zero counterparty friction.",
    authorInitial: "ISO",
    author: "Standards Committee",
    authorColor: "bg-violet-500/20 text-violet-300",
    linkColor: "text-violet-300 hover:text-violet-200",
    bulletinBadge: "ISO 20022 COMPLIANCE",
    bulletinByline: "Published by ISO Financial Standards Committee",
    bulletinBody: [
      "BRUSSELS — The global transition to ISO 20022 financial messaging has reached unified enforcement for institutional credit transfers.",
      "Our digital asset custody platform has integrated end-to-end XML validation for pacs.008, pacs.009, and camt.053 audit feeds, ensuring full compliance for sovereign and institutional transfers worldwide.",
    ],
    bulletinBulletsTitle: null,
    bulletinBullets: [],
  },
  {
    tag: "MARKET INSIGHT",
    category: "market",
    tagColor: "bg-emerald-500/15 text-emerald-300",
    time: "5 hours ago",
    title: "Institutional Vault Reserves Cross $3.84 Billion in Total Assets",
    text: "Sovereign member registrations and multi-asset vault lock-ins surge as institutional participants migrate liquidity into quantum-encrypted cold storage facilities.",
    authorInitial: "M",
    author: "Global Markets Desk",
    authorColor: "bg-emerald-500/20 text-emerald-300",
    linkColor: "text-emerald-300 hover:text-emerald-200",
    bulletinBadge: "MARKET INTELLIGENCE",
    bulletinByline: "Published by Global Markets Desk",
    bulletinBody: [
      "NEW YORK & SINGAPORE — Institutional digital asset reserves locked in verified sovereign vaults have surpassed $3.84 Billion USD in cumulative value.",
      "The record inflow is attributed to institutional demand for zero-trust custody, hardware passkey security, and instant spending capabilities via the QFS 24KT Gold and institutional metal card issuance programs.",
    ],
    bulletinBulletsTitle: null,
    bulletinBullets: [],
  },
];

type NewsFilter = "all" | "qfs" | "iso" | "market";

export default function HomePage() {
  const [cardTier, setCardTier] = useState(0);
  const [newsFilter, setNewsFilter] = useState<NewsFilter>("all");
  const [activeBulletin, setActiveBulletin] = useState<number | null>(null);
  const tier = cardTiers[cardTier];
  const visibleNews = newsCards.filter(
    (n) => newsFilter === "all" || n.category === newsFilter,
  );
  const bulletin = activeBulletin !== null ? newsCards[activeBulletin] : null;

  return (
    <main className="bg-[#040711] text-slate-200">
      <SiteHeader />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.35),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1000px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-cyan-300">

            <CircleDot
              size={12}
              className="animate-quantum-blink text-cyan-300"
            />

            QUANTUM FINANCIAL SYSTEM • ISO 20022 COMPLIANT

          </span>



          <h1 className="mx-auto mt-7 max-w-[920px] text-[40px] font-black leading-[1.06] tracking-[-0.03em] text-white sm:text-[58px] md:text-[70px]">
            Quantum Finance{" "}
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
<section className="w-full overflow-hidden bg-[#070B16] px-3 pb-14 sm:px-5 lg:px-8">

  <div className="mx-auto w-full max-w-[1080px]">

    {/* ================= LEDGER CONTAINER ================= */}
    <div className="w-full overflow-hidden rounded-[24px] border border-[#29345F] bg-[#101626] shadow-[0_0_30px_rgba(59,72,180,0.10)] animate-ledger-live sm:rounded-[26px]">

      {/* ================= LEDGER HEADER ================= */}
      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-7">

        {/* Logo and Ledger Information */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">

          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#2876f5] to-[#20c4e9] text-white shadow-lg shadow-blue-500/20 sm:h-12 sm:w-12">
            <Shield size={22} />
          </span>

          <div className="min-w-0 flex-1">

            <h2 className="break-words text-[15px] font-bold leading-tight text-[#e5eaf5] sm:text-[18px] lg:text-[19px]">
              QFS Sovereign Asset Ledger
            </h2>

            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[9px] leading-relaxed sm:text-[11px] lg:text-[12px]">

              <span className="font-semibold text-[#8490a5]">
                Node ID:
              </span>

              <span className="font-mono text-[#67d7e8]">
                QFS-NODE-7849
              </span>

              <span className="text-[#465166]">•</span>

              <span className="font-semibold text-[#8490a5]">
                Status:
              </span>

              <span className="font-semibold text-[#39d5a0]">
                Verified Online
              </span>

            </p>
          </div>
        </div>

        {/* ================= SECURITY BADGES ================= */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:justify-end">

          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#087b60]/40 bg-[#06352e]/50 px-2.5 py-1.5 text-[9px] font-bold text-[#36c89c] sm:px-3 sm:text-[11px]">
            <Lock size={11} />
            256-Bit Quantum Encrypted
          </span>

          <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[#6535a0]/50 bg-[#26153d]/60 px-3 py-1.5 text-[9px] font-bold text-[#b58aff] sm:text-[11px]">
            ISO 20022
          </span>

        </div>
      </div>

      {/* ================= DIVIDER ================= */}
      <div className="mx-4 border-t border-[#202941] sm:mx-6 lg:mx-7" />

      {/* ================= ASSET GRID ================= */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-6 lg:grid-cols-4 lg:p-7">

        {ledgerAssets.map((asset) => (
          <div
            key={asset.name}
            className="flex min-w-0 min-h-[120px] flex-col items-center justify-center rounded-2xl border border-[#2A3142] bg-[#1B2232] px-2 py-4 text-center transition-all duration-300 hover:border-[#46547A] hover:bg-[#202A3D] sm:min-h-[125px] sm:px-4 sm:py-5 lg:min-h-[140px]"
          >

            <p className="break-words text-[11px] font-semibold text-[#929bad] sm:text-[12px] lg:text-[13px]">
              {asset.name}
            </p>

            <p className={`mt-2 break-words text-[16px] font-black sm:text-[19px] lg:text-[20px] ${asset.color}`}>
              {asset.value}
            </p>

            <p className="mt-1 break-words text-[9px] text-[#727e94] sm:text-[10px] lg:text-[11px]">
              {asset.sub}
            </p>

          </div>
        ))}

      </div>
    </div>

    {/* ================= LEDGER STATISTICS ================= */}
    <div className="mt-8 grid grid-cols-2 gap-x-2 gap-y-7 sm:mt-10 sm:gap-x-6 sm:gap-y-8 lg:mt-12 lg:grid-cols-4 lg:gap-6">

      {stats.map((s, index) => (
        <div
          key={s.label}
          className="flex min-w-0 flex-col items-center justify-center text-center"
        >

          {/* Statistics Value */}
          <p
            className={`break-words text-[27px] font-black leading-tight tracking-tight sm:text-[34px] lg:text-[42px] ${
              index === 0
                ? "text-white"
                : index === 1
                ? "text-[#22D3EE]"
                : index === 2
                ? "text-[#818CF8]"
                : "text-[#C084FC]"
            }`}
          >
            {s.value}
          </p>

          {/* Statistics Label */}
          <p className="mt-1 max-w-full text-[9px] font-bold uppercase leading-relaxed tracking-wide text-[#9CA3AF] sm:mt-2 sm:text-[10px] lg:text-[11px] lg:tracking-[0.12em]">
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
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-amber-400">
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

    {/* Card network section */}
    <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">

      {/* Left: card preview */}
      <div className="flex flex-col items-center sm:block">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {cardTiers.map((t, i) => (
            <button
              key={t.tab}
              type="button"
              onClick={() => setCardTier(i)}
              aria-pressed={cardTier === i}
              className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                cardTier === i
                  ? "bg-[#332711] text-amber-400 ring-1 ring-amber-500/40"
                  : "bg-[#141720] text-slate-400 hover:text-slate-200"
              }`}
            >
              {cardTier === i && <Sparkles size={12} className="mr-1 inline text-amber-400" />}
              {t.tab}
            </button>
          ))}
        </div>

        <div className={`relative mx-auto mt-6 aspect-[1.6/1] w-full max-w-[460px] overflow-hidden rounded-3xl bg-gradient-to-br ${tier.preview.gradient} p-6 shadow-2xl ${tier.preview.glow}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${tier.preview.ink} opacity-70`}>
                Quantum Finance
              </p>
              <p className={`mt-1 text-[11px] font-bold ${tier.preview.ink} opacity-60`}>
                {tier.preview.topLabel}
              </p>
            </div>

            <span className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold ${tier.preview.badge}`}>
              {tier.preview.network}
            </span>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <div className={`grid h-8 w-11 grid-cols-3 grid-rows-3 gap-0.5 rounded-md bg-gradient-to-br ${tier.preview.chip} p-1`}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`rounded-[1px] ${tier.preview.chipCell}`} />
              ))}
            </div>
            <span className={`${tier.preview.ink} opacity-70`}>))</span>
          </div>

          <p className={`mt-5 text-[20px] font-black tracking-[0.15em] ${tier.preview.ink}`}>
            {tier.preview.number}
          </p>

          <div className={`mt-6 flex items-end justify-between ${tier.preview.ink}`}>
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
              <p className="text-[12px] font-bold">{tier.preview.expires}</p>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider opacity-70">
                Daily Limit
              </p>
              <p className="text-[12px] font-bold">{tier.preview.dailyLimit}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[12px] font-semibold text-amber-400 sm:justify-start">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Instant Virtual Issuance
          </span>

          <span className="inline-flex items-center gap-1.5 text-cyan-400">
            <Globe2 size={14} /> Worldwide POS &amp; ATM
          </span>
        </div>
      </div>

      {/* Right: tiers + features */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[16px] font-bold text-white">
            <CreditCard size={18} className="text-cyan-400" />
            SUPPORTED CARD NETWORKS &amp; TIERS
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {cardTiers.map((t) => (
            <div
              key={t.title}
              className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:border-white/15 ${
                t.badge === "24K"
                  ? "border-amber-500/30 bg-[#1b1711]"
                  : "border-[#292c36] bg-[#141720]"
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[11px] font-black ${
                  t.badge === "24K"
                    ? "bg-[#493510] text-amber-400"
                    : t.badge === "VISA"
                    ? "bg-[#142d50] text-blue-400"
                    : t.badge === "MC"
                    ? "bg-[#42202f] text-pink-400"
                    : "bg-[#123449] text-cyan-400"
                }`}
              >
                {t.badge}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-white">
                  {t.title}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {t.sub}
                </p>
              </div>

              <span
                className={`text-[12px] font-bold ${
                  t.badge === "24K"
                    ? "text-amber-400"
                    : t.badge === "MC"
                    ? "text-pink-400"
                    : "text-cyan-400"
                }`}
              >
                {t.limit}
              </span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-5 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#180b35] to-[#260a3e] p-5">
          <h4 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-cyan-400">
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
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 px-6 text-[14px] font-bold text-black shadow-lg shadow-amber-500/10 transition hover:brightness-110"
          >
            <CreditCard size={16} /> Apply for Quantum Card <ArrowRight size={15} />
          </Link>

          <span className="text-[12px] text-slate-400">
            Instant virtual activation upon account verification
          </span>
        </div>
      </div>
          </div>
          {/* Feature pills */}
<div className="mx-auto mt-12 grid max-w-[1100px] gap-4 sm:grid-cols-3">
  {smartCardPills.map((p, i) => {
    const Icon = p.icon;

    const iconColors = [
      "bg-[#332711] text-[#fbbf24]", // Amber
      "bg-[#102e38] text-[#22d3ee]", // Cyan
      "bg-[#2c1e45] text-[#a78bfa]", // Purple
    ];

    return (
      <div
        key={p.text}
        className="flex items-center gap-3 rounded-2xl border border-[#232731] bg-[#141720] px-4 py-3.5"
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
            iconColors[i % iconColors.length]
          }`}
        >
          <Icon size={16} />
        </span>

        <p className="text-[12.5px] font-medium text-[#e2e5ec]">
          {p.text}
        </p>
      </div>
    );
  })}
</div>
  </div>
</section>

      {/* ===================== ECOSYSTEM BULLETINS & NEWS ===================== */}
      <section className="border-t border-white/5 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-quantum-blink" />
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
              {(
                [
                  { id: "all", label: "All Intelligence" },
                  { id: "qfs", label: "QFS Protocols" },
                  { id: "iso", label: "ISO 20022" },
                  { id: "market", label: "Market Insights" },
                ] as { id: NewsFilter; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setNewsFilter(f.id)}
                  aria-pressed={newsFilter === f.id}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                    newsFilter === f.id
                      ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30"
                      : "bg-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {visibleNews.map((n) => {
              const realIndex = newsCards.indexOf(n);
              return (
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
                    <button
                      type="button"
                      onClick={() => setActiveBulletin(realIndex)}
                      className={`inline-flex items-center gap-1.5 text-[12px] font-bold transition ${n.linkColor}`}
                    >
                      Read Bulletin <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              );
            })}
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

      {/* Bulletin Modal */}
      {bulletin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulletin-title"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveBulletin(null)}
          />
          <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-y-auto rounded-3xl border border-cyan-500/25 bg-[#0a1020] p-7 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setActiveBulletin(null)}
              aria-label="Close bulletin"
              className="absolute right-5 top-5 text-slate-400 transition hover:text-white"
            >
              <X size={22} />
            </button>

            <span
              className={`inline-flex w-fit rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${bulletin.tagColor}`}
            >
              {bulletin.bulletinBadge}
            </span>

            <h2
              id="bulletin-title"
              className="mt-5 text-[24px] font-black leading-tight tracking-tight text-white sm:text-[28px]"
            >
              {bulletin.title}
            </h2>

            <p className="mt-3 text-[12.5px] font-medium text-slate-400">
              {bulletin.bulletinByline} &bull; {bulletin.time}
            </p>

            <div className="my-6 h-px w-full bg-white/10" />

            <div className="space-y-4 text-[14px] leading-[1.75] text-slate-300">
              {bulletin.bulletinBody.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              {bulletin.bulletinBulletsTitle && (
                <p className="font-semibold text-white">{bulletin.bulletinBulletsTitle}</p>
              )}

              {bulletin.bulletinBullets.length > 0 && (
                <ul className="ml-1 space-y-2">
                  {bulletin.bulletinBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveBulletin(null)}
              className="mt-8 w-full rounded-2xl bg-white/10 py-3.5 text-[14px] font-bold text-white transition hover:bg-white/15"
            >
              Close Bulletin
            </button>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
