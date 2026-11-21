"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, FileText, Menu, X, ChartNoAxesCombined } from "lucide-react";
import { Brand } from "@/components/brand";

const navLinks = [
  { href: "/", label: "HOME", icon: Home, exact: true },
  { href: "/about", label: "ABOUT QFS", icon: ShieldCheck },
  { href: "/whitepaper", label: "WHITEPAPER & ISO PDF", icon: FileText },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname?.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#1a2030] bg-[#090d19]/95 backdrop-blur">
      {/* Market ticker */}
      <div className="bg-[#040711] border-b border-indigo-500/10 py-2 overflow-hidden z-50 text-[11px] font-semibold text-gray-400">
        <div className="animate-marquee flex items-center space-x-8 whitespace-nowrap">
          <div className="flex items-center space-x-8">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-quantum-blink"></span> <strong className="text-white">QFS Mainnet:</strong> <span className="text-emerald-400">100% Operational</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">XLM (Stellar):</strong> <span className="ticker-xlm-price text-purple-300 font-bold">$0.1418</span> <span className="ticker-xlm-change text-emerald-400 font-bold">+3.50%</span> <span className="text-slate-500">(indicative)</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">XRP (Ripple):</strong> <span className="ticker-xrp-price text-cyan-300 font-bold">$1.0016</span> <span className="ticker-xrp-change text-emerald-400 font-bold">+4.71%</span> <span className="text-slate-500">(indicative)</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">ISO 20022 Status:</strong> <span className="text-cyan-300 font-bold">Synchronized</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">Settlement Protocol:</strong> <span className="text-emerald-400">Instant Finality</span></span>
          </div>
          <div className="flex items-center space-x-8">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-quantum-blink"></span> <strong className="text-white">QFS Mainnet:</strong> <span className="text-emerald-400">100% Operational</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">XLM (Stellar):</strong> <span className="ticker-xlm-price text-purple-300 font-bold">$0.1418</span> <span className="ticker-xlm-change text-emerald-400 font-bold">+3.50%</span> <span className="text-slate-500">(indicative)</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">XRP (Ripple):</strong> <span className="ticker-xrp-price text-cyan-300 font-bold">$1.0016</span> <span className="ticker-xrp-change text-emerald-400 font-bold">+4.71%</span> <span className="text-slate-500">(indicative)</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">ISO 20022 Status:</strong> <span className="text-cyan-300 font-bold">Synchronized</span></span>
            <span className="flex items-center gap-1.5"><strong className="text-white">Settlement Protocol:</strong> <span className="text-emerald-400">Instant Finality</span></span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex min-h-[60px] max-w-[1180px] items-center justify-between gap-2 px-3 min-[360px]:px-4 sm:min-h-[66px] sm:px-5">
        <Link aria-label="Qfs Tier-4B home" href="/" className="hidden shrink-0 md:inline-flex">
          <Brand compact />
        </Link>
        <Link
          aria-label="Quantum Finance home"
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 md:hidden"
        >
          <ChartNoAxesCombined
            aria-hidden="true"
            className="h-8 w-8 text-white"
            strokeWidth={2.8}
          />
          <span className="flex flex-col text-left text-[13px] font-black leading-[0.92] tracking-[-0.045em] text-white">
            <span>Quantum</span>
            <span>Finance</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative inline-flex items-center gap-1.5 text-[12px] font-bold transition ${
                  active ? "text-cyan-300" : "text-slate-300 hover:text-white"
                }`}
              >
                <Icon aria-hidden="true" size={13} fill="currentColor" /> {link.label}
                <span
                  className={`absolute -bottom-2 left-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            className="inline-flex whitespace-nowrap px-1.5 text-[12px] font-medium text-slate-200 transition hover:text-white focus-visible:text-white max-[359px]:hidden sm:px-0"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="gradient-button relative isolate inline-flex h-10 items-center justify-center whitespace-nowrap overflow-hidden rounded-[14px] px-4 text-[12px] font-bold text-white active:scale-[0.98] sm:h-auto sm:px-5 sm:py-2.5"
            href="/register"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-[14px] bg-[linear-gradient(105deg,#6939ef_0%,#9639e8_52%,#17bfd1_100%)] md:hidden"
            />
            <span className="relative">Open Vault</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-10 w-10 place-items-center rounded-[14px] border border-[#252b3b] bg-[#111625] text-slate-200 transition hover:bg-white/10 active:scale-[0.97] focus-visible:outline-offset-2 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="border-t border-[#1a2030] bg-[#0b1120] md:hidden"
        >
          <div className="mx-auto flex max-w-[1180px] flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-3 text-[13px] font-bold transition ${
                    active ? "bg-white/5 text-cyan-300" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon aria-hidden="true" size={15} fill="currentColor" /> {link.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-[13px] font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
