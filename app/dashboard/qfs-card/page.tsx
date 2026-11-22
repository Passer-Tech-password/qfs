"use client";

import { CreditCard, Banknote, ArrowRight, Sparkles } from "lucide-react";

type CardTier = {
  id: string;
  brand: string;
  brandColor: string;
  name: string;
  limit: string;
  description: string;
  fee: string;
  buttonColor: string;
  buttonHover: string;
};

const cardTiers: CardTier[] = [
  {
    id: "visa",
    brand: "VISA",
    brandColor: "bg-blue-600",
    name: "Visa Card",
    limit: "$10,000",
    description:
      "Standard virtual Visa card for global online purchases. Accepted worldwide with standard security.",
    fee: "$50.00",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    buttonHover: "",
  },
  {
    id: "mastercard",
    brand: "MC",
    brandColor: "bg-red-500",
    name: "Master Card",
    limit: "$25,000",
    description:
      "Premium Mastercard with enhanced security and higher spending limits. Perfect for business & high volume.",
    fee: "$100.00",
    buttonColor: "bg-rose-500 hover:bg-rose-600",
    buttonHover: "",
  },
  {
    id: "amex",
    brand: "AMEX",
    brandColor: "bg-teal-600",
    name: "American Express",
    limit: "$18,000",
    description:
      "Premium American Express card with travel benefits, charge limits, and membership rewards program.",
    fee: "$150.00",
    buttonColor: "bg-slate-800 hover:bg-slate-900",
    buttonHover: "",
  },
  {
    id: "qfs-gold",
    brand: "QFS",
    brandColor: "bg-amber-500",
    name: "QFS 24KT Gold Card",
    limit: "$35,000",
    description:
      "Exclusive luxury 24KT gold metallic card with highest institutional spending limits and VIP concierge.",
    fee: "$250.00",
    buttonColor: "bg-amber-500 hover:bg-amber-600",
    buttonHover: "",
  },
];

export default function QfsCardPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      {/* Quantum Card Operations */}
      <div className="overflow-hidden rounded-[22px] bg-gradient-to-r from-[#1a1843] via-[#2a2566] to-[#3b1d6b] p-7 text-white shadow-xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
              <CreditCard size={12} /> Quantum Card Operations
            </span>
            <p className="mt-3 text-[12.5px] text-indigo-100">Total Portfolio Value</p>
            <p className="mt-0.5 text-[32px] font-black leading-none tracking-tight sm:text-[38px] lg:text-[42px]">
              $0.00
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-indigo-200">
              <span className="font-semibold text-white">Available Assets: $0.00</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-300">USDT/Fiat: $0.00</span>
              <span aria-hidden="true">·</span>
              <span>Crypto Holdings: $0.00</span>
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Banknote size={20} />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold text-indigo-100">Account Fiat / USDT</p>
              <p className="text-[22px] font-black">$0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Card Preview */}
      <div className="mt-8">
        <h2 className="text-[20px] font-bold text-slate-900">Live Interactive Card Preview</h2>
        <p className="mt-0.5 text-[12.5px] text-slate-500">
          Click the preview card or choose any tier below to launch the instant card issuance modal.
        </p>

        <div className="mt-5 flex flex-col items-center">
          {/* Card preview */}
          <div className="relative min-h-[200px] w-full max-w-[340px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a2540] via-[#1a3a5c] to-[#2a4a7c] p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-300">
                  Qfsiter-4bwallet
                </p>
                <p className="mt-1 text-[18px] font-bold">Visa Card</p>
              </div>
              <span className="text-[16px] font-black italic">VISA</span>
            </div>

            {/* Chip + contactless */}
            <div className="mt-5 flex items-center gap-2">
              <div className="grid h-8 w-11 grid-cols-3 grid-rows-3 gap-0.5 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 p-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-[1px] bg-yellow-600/40" />
                ))}
              </div>
              <div className="text-slate-300">
                <Sparkles size={18} />
              </div>
              <button className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold">
                <CreditCard size={11} /> Click to Apply
              </button>
            </div>

            {/* Card number */}
            <p className="mt-4 text-[17px] font-bold tracking-[0.12em] sm:text-[20px] sm:tracking-[0.15em]">
              4 5 3 2 <span className="text-slate-400">••••</span>{" "}
              <span className="text-slate-400">••••</span>{" "}
              <span className="text-slate-400">••••</span>
            </p>

            {/* Footer */}
            <div className="mt-3 flex items-end justify-between text-[10px]">
              <div>
                <p className="text-slate-400 uppercase">Card Holder</p>
                <p className="font-bold">CRISTIANA456</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase">Expires</p>
                <p className="font-bold">02/30</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase">Limit</p>
                <p className="font-bold text-emerald-300">$10,000</p>
              </div>
            </div>
          </div>

          <button className="dash-submit mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold text-white">
            <CreditCard size={15} /> Apply For This Card
          </button>
        </div>
      </div>

      {/* Select Your Quantum Card */}
      <div className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-slate-900">Select Your Quantum Card</h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Click any card below to open the instant issuance application pop-up modal.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600">
            4 Sovereign Tiers Available
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {cardTiers.map((card) => (
            <div
              key={card.id}
              className="dash-card flex flex-col p-5 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.brandColor} text-[11px] font-black text-white`}
                  >
                    {card.brand}
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900">{card.name}</h3>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                  Limit: {card.limit}
                </span>
              </div>

              <p className="mt-3 text-[12.5px] leading-relaxed text-slate-500">
                {card.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[11px] text-slate-400">Issuance Fee</p>
                  <p className="text-[15px] font-black text-slate-900">{card.fee}</p>
                </div>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[12.5px] font-bold text-white transition ${card.buttonColor}`}
                >
                  Apply Now <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfsiter-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
