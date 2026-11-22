"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FileCode, Scale, ShieldCheck, Eye, Download } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

type Doc = {
  id: string;
  category: "architecture" | "iso" | "audit";
  icon: typeof FileText;
  iconBg: string;
  badge: string;
  badgeTone: string;
  hash?: string;
  title: string;
  description: string;
  bullets: { text: string; tone: string }[];
  readTone: string;
  pdfGradient: string;
};

const docs: Doc[] = [
  {
    id: "qfs-architecture",
    category: "architecture",
    icon: FileText,
    iconBg: "bg-gradient-to-br from-cyan-400 to-blue-600",
    badge: "VERSION 4.2 • VERIFIED",
    badgeTone: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/30",
    hash: "SHA-256: 8F4a9b...c21a",
    title: "Quantum Financial System Architecture Whitepaper",
    description:
      "Comprehensive technical overview covering post-quantum lattice cryptography, distributed ledger sharding, real-time stellar asset bridges, and sub-second multi-asset finality.",
    bullets: [
      { text: "512-Bit Quantum Resistant Enclave", tone: "text-cyan-300" },
      { text: "Stellar XLM & Ripple XRP Native Liquidity", tone: "text-cyan-300" },
      { text: "Multi-Sig Hardware-Bound MPC Key Derivation", tone: "text-cyan-300" },
    ],
    readTone: "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10",
    pdfGradient: "from-cyan-500 to-violet-600",
  },
  {
    id: "iso-20022",
    category: "iso",
    icon: FileCode,
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    badge: "ISO 20022 • XML/MX",
    badgeTone: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
    hash: "pacs.008 • camt.053",
    title: "ISO 20022 Financial Messaging Schema & Interoperability",
    description:
      "Full integration documentation detailing financial data exchange schemas, end-to-end remittance identifiers, cross-border payment rails, and institutional compliance standards.",
    bullets: [
      { text: "pacs.008 & pacs.009 Real-Time Settlement", tone: "text-violet-300" },
      { text: "SWIFT CBPR+ Schema Compatibility", tone: "text-violet-300" },
      { text: "Immutable Audit Metadata Encoding", tone: "text-violet-300" },
    ],
    readTone: "border-violet-500/30 text-violet-300 hover:bg-violet-500/10",
    pdfGradient: "from-violet-500 to-fuchsia-600",
  },
  {
    id: "nesara-gesara",
    category: "architecture",
    icon: Scale,
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
    badge: "SOVEREIGN PROTOCOL",
    badgeTone: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
    hash: "Asset-Backed Vaults",
    title: "NESARA / GESARA Global Transition & Asset Realignment",
    description:
      "Guidance for sovereign wealth accounts, gold/precious-metal asset-backed currency pegging, debt jubilee settlement channels, and global humanitarian disbursement networks.",
    bullets: [
      { text: "100% Asset-Backed Capital Validation", tone: "text-amber-300" },
      { text: "Decentralized Sovereign Trust Framework", tone: "text-amber-300" },
      { text: "Humanitarian Project Allocation Standards", tone: "text-amber-300" },
    ],
    readTone: "border-amber-500/30 text-amber-300 hover:bg-amber-500/10",
    pdfGradient: "from-amber-500 to-orange-600",
  },
  {
    id: "audit-report",
    category: "audit",
    icon: ShieldCheck,
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-600",
    badge: "FORMAL AUDIT • PASS",
    badgeTone: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
    hash: "Score: 99.4 / 100",
    title: "Quantum Cryptographic & Smart Vault Audit Report",
    description:
      "Independent mathematical verification and penetration audit confirming zero vulnerabilities in biometric enclave authorization, cold storage derivations, and automated fixed profit distribution algorithms.",
    bullets: [
      { text: "Zero Critical or High Severity Findings", tone: "text-emerald-300" },
      { text: "Formal Mathematical Proof of Non-Custodial Solvency", tone: "text-emerald-300" },
      { text: "WebAuthn / FIDO2 Level-3 Compliance", tone: "text-emerald-300" },
    ],
    readTone: "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10",
    pdfGradient: "from-emerald-500 to-teal-600",
  },
];

type Filter = "all" | "architecture" | "iso" | "audit";

const filters: { id: Filter; label: string; count?: number }[] = [
  { id: "all", label: "All Documents", count: docs.length },
  { id: "architecture", label: "QFS Architecture" },
  { id: "iso", label: "ISO 20022 Standards" },
  { id: "audit", label: "Security Audits" },
];

export default function WhitepaperPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible =
    filter === "all" ? docs : docs.filter((d) => d.category === filter);

  return (
    <main>
      <SiteHeader />

      {/* Hero */}
      <section className="px-5 pb-12 pt-14 sm:pt-20">
        <div className="mx-auto max-w-[900px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1.5 text-[10px] font-extrabold tracking-[0.08em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-quantum-blink" />
            OFFICIAL TECHNICAL SPECIFICATIONS &amp; WHITE PAPERS
          </span>
          <h1 className="mx-auto mt-6 max-w-[820px] text-[38px] font-black leading-[1.1] tracking-[-0.04em] text-white sm:text-[52px]">
            Technical Architecture &amp;{" "}
            <span className="gradient-text">Compliance Center</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[680px] text-[14px] leading-[1.7] text-slate-300 sm:text-[15.5px]">
            Inspect verified cryptographic audits, ISO 20022 message schema specifications, 512-bit
            post-quantum security proofs, and sovereign ledger protocols.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mx-auto mt-10 flex max-w-[1100px] flex-wrap items-center justify-center gap-2">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-5 py-2.5 text-[12.5px] font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "border border-[#2a3148] bg-[#101522] text-slate-300 hover:border-violet-500/40 hover:text-white"
                }`}
              >
                {f.label}
                {f.count !== undefined && ` (${f.count})`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Document cards */}
      <section className="px-5 pb-20">
        <div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-2">
          {visible.map((doc) => {
            const Icon = doc.icon;
            return (
              <article
                key={doc.id}
                className="flex flex-col rounded-3xl border border-[#242b3a] bg-[#101522] p-7 transition hover:border-violet-500/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl ${doc.iconBg} text-white shadow-lg`}
                  >
                    <Icon size={26} />
                  </span>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[9px] font-extrabold tracking-wider ring-1 ${doc.badgeTone}`}
                    >
                      {doc.badge}
                    </span>
                    {doc.hash && (
                      <p className="mt-1.5 font-mono text-[9px] text-slate-500">{doc.hash}</p>
                    )}
                  </div>
                </div>

                <h3 className="mt-5 text-[20px] font-bold leading-tight text-white">
                  {doc.title}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.7] text-slate-400">{doc.description}</p>

                <ul className="mt-5 space-y-2">
                  {doc.bullets.map((b) => (
                    <li key={b.text} className="flex items-center gap-2.5 text-[12.5px]">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${b.tone.replace("text-", "bg-")}`}
                      />
                      <span className="text-slate-300">{b.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex gap-3 border-t border-[#1f2738] pt-6">
                  <Link
                    href="/register"
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border bg-[#0c111d] px-4 py-3 text-[12.5px] font-bold transition ${doc.readTone}`}
                  >
                    <Eye size={15} /> Read Specs
                  </Link>
                  <Link
                    href="/register"
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${doc.pdfGradient} px-4 py-3 text-[12.5px] font-bold text-white shadow-lg transition hover:brightness-110`}
                  >
                    <Download size={15} /> Download PDF
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-[#1a2030] bg-[#090d19] px-5 py-8">
        <p className="mx-auto max-w-[900px] text-center text-[12px] leading-relaxed text-slate-500">
          Qfsiter-4bwallet is a sovereign digital authentication and quantum asset ledger
          access-control platform providing 512-bit encrypted identity verification, biometric
          multi-factor authentication, and ISO 20022 compliance protocols for global digital asset
          systems.
        </p>
      </section>
    </main>
  );
}
