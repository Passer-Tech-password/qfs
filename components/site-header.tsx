"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, FileText, Menu, X } from "lucide-react";
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
      <div className="mx-auto flex min-h-[66px] max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-5">
        <Link aria-label="Qfs Tier-4B home" href="/">
          <Brand compact />
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

        <div className="flex items-center gap-3">
          <Link
            className="hidden text-[12px] font-bold text-slate-200 transition hover:text-white sm:inline-flex"
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="gradient-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white sm:px-5"
            href="/register"
          >
            Open Vault
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#1f2740] text-slate-200 transition hover:bg-white/5 md:hidden"
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
