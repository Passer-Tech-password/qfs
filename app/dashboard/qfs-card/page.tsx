"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CreditCard,
  Banknote,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { useWalletBalances } from "@/lib/hooks/use-wallet-balances";
import { useUserProfile } from "@/lib/hooks/use-user-profile";

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
    brandColor: "bg-red-600",
    name: "Master Card",
    limit: "$25,000",
    description:
      "Premium Mastercard with enhanced security and higher spending limits. Perfect for business & high volume.",
    fee: "$100.00",
    buttonColor: "bg-red-600 hover:bg-red-700",
    buttonHover: "",
  },
  {
    id: "amex",
    brand: "AMEX",
    brandColor: "bg-blue-600",
    name: "American Express",
    limit: "$18,000",
    description:
      "Premium American Express card with travel benefits, charge limits, and membership rewards program.",
    fee: "$150.00",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    buttonHover: "",
  },
  {
    id: "qfs-gold",
    brand: "QFS",
    brandColor: "bg-amber-400",
    name: "QFS 24KT Gold Card",
    limit: "$35,000",
    description:
      "Exclusive luxury 24KT gold metallic card with highest institutional spending limits and VIP concierge.",
    fee: "$250.00",
    buttonColor: "bg-amber-400 hover:bg-amber-500",
    buttonHover: "",
  },
];

const fieldClassName =
  "mt-1.5 block min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

function ApplicationField({
  id,
  label,
  required = false,
  optional = false,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[12.5px] font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
        {optional && <span className="ml-1 font-normal text-slate-400">(Optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ApplicationSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[12px] font-bold text-white">
          {number}
        </span>
        <h3 className="text-[12.5px] font-extrabold tracking-wide text-slate-800 sm:text-[13px]">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function CardApplicationModal({
  card,
  onClose,
  onSubmit,
}: {
  card: CardTier;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  const spendingLimit = Number(card.limit.replace(/[$,]/g, ""));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-2.5 backdrop-blur-sm sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-application-title"
        className="flex max-h-[calc(100vh-1.25rem)] max-h-[calc(100dvh-1.25rem)] w-full max-w-[820px] flex-col overflow-hidden rounded-[24px] border border-white/70 bg-[#fbfcff] shadow-2xl sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 bg-gradient-to-r from-[#211e53] via-[#302679] to-[#4b0871] px-4 py-4 text-white sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 sm:h-14 sm:w-14">
              <CreditCard size={27} strokeWidth={2.3} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2.5 py-1 text-[10px] font-extrabold leading-none ${card.brandColor}`}
                >
                  {card.brand}
                </span>
                <span className="truncate font-mono text-[10px] text-indigo-200 sm:text-[11px]">
                  QFS Sovereign Vault
                </span>
              </div>
              <h2
                id="card-application-title"
                className="mt-1 truncate text-[18px] font-extrabold leading-tight tracking-tight sm:text-[21px]"
              >
                Apply for {card.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close card application"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <X size={19} strokeWidth={2.5} />
          </button>
        </header>

        <form
          onSubmit={handleFormSubmit}
          className="min-h-0 overflow-y-auto overscroll-contain px-3 py-3 sm:px-7 sm:py-4"
        >
          <div className="mb-5 flex flex-col justify-between gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="text-[12px] font-bold text-indigo-900">
                Instant Approval &amp; Encrypted Verification
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-indigo-500">
                Your application will be validated by QFS network consensus nodes upon submission.
              </p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:block sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                Max Spending Limit
              </p>
              <p className="text-[15px] font-extrabold text-indigo-950">{card.limit}</p>
            </div>
          </div>

          <div className="space-y-5">
            <ApplicationSection number={1} title="CARDHOLDER IDENTITY & KYC">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <ApplicationField id="legal-name" label="Legal Full Name" required>
                  <input
                    id="legal-name"
                    name="legalName"
                    autoComplete="name"
                    required
                    className={fieldClassName}
                    placeholder="Enter your legal full name"
                  />
                </ApplicationField>
                <ApplicationField id="embossed-name" label="Embossed Name on Card" required>
                  <input
                    id="embossed-name"
                    name="embossedName"
                    autoComplete="cc-name"
                    maxLength={26}
                    required
                    className={fieldClassName}
                    placeholder="Name as it should appear"
                  />
                </ApplicationField>
                <ApplicationField id="email-address" label="Email Address" required>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={fieldClassName}
                    placeholder="you@example.com"
                  />
                </ApplicationField>
                <ApplicationField id="phone-number" label="Phone Number" required>
                  <input
                    id="phone-number"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className={fieldClassName}
                    placeholder="+1 555 123 4567"
                  />
                </ApplicationField>
                <ApplicationField id="date-of-birth" label="Date of Birth (DOB)" required>
                  <input
                    id="date-of-birth"
                    name="dateOfBirth"
                    type="date"
                    autoComplete="bday"
                    required
                    className={fieldClassName}
                  />
                </ApplicationField>
                <ApplicationField id="government-id-type" label="Government ID Type" required>
                  <select
                    id="government-id-type"
                    name="governmentIdType"
                    required
                    defaultValue="national-id"
                    className={fieldClassName}
                  >
                    <option value="national-id">National Identity Card (ID)</option>
                    <option value="passport">Passport</option>
                    <option value="drivers-license">Driver&apos;s License</option>
                  </select>
                </ApplicationField>
                <ApplicationField
                  id="government-id-number"
                  label="ID / Passport / Document Number"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    id="government-id-number"
                    name="governmentIdNumber"
                    autoComplete="off"
                    required
                    className={fieldClassName}
                    placeholder="Enter passport number, ID document number, or DL number"
                  />
                </ApplicationField>
              </div>
            </ApplicationSection>

            <ApplicationSection number={2} title="BILLING & DELIVERY ADDRESS">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <ApplicationField
                  id="country"
                  label="Country / Territory"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    required
                    className={fieldClassName}
                    placeholder="e.g. United States, United Kingdom, Canada, Australia"
                  />
                </ApplicationField>
                <ApplicationField id="street-address" label="Street Address" required>
                  <input
                    id="street-address"
                    name="streetAddress"
                    autoComplete="address-line1"
                    required
                    className={fieldClassName}
                    placeholder="e.g. 742 Evergreen Terrace"
                  />
                </ApplicationField>
                <ApplicationField id="address-line2" label="Apartment / Suite" optional>
                  <input
                    id="address-line2"
                    name="addressLine2"
                    autoComplete="address-line2"
                    className={fieldClassName}
                    placeholder="e.g. Apt 4B, Suite 200"
                  />
                </ApplicationField>
                <ApplicationField id="city" label="City" required>
                  <input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    required
                    className={fieldClassName}
                    placeholder="e.g. New York, London, Zurich"
                  />
                </ApplicationField>
                <ApplicationField id="state-region" label="State / Province" required>
                  <input
                    id="state-region"
                    name="stateRegion"
                    autoComplete="address-level1"
                    required
                    className={fieldClassName}
                    placeholder="e.g. California, Ontario, Zurich"
                  />
                </ApplicationField>
                <ApplicationField
                  id="postal-code"
                  label="ZIP / Postal Code"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    id="postal-code"
                    name="postalCode"
                    autoComplete="postal-code"
                    required
                    className={fieldClassName}
                    placeholder="e.g. 10001, SW1A 1AA, 8001"
                  />
                </ApplicationField>
              </div>
            </ApplicationSection>

            <ApplicationSection number={3} title="CARD SPECIFICATIONS & SECURITY SETUP">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <ApplicationField id="settlement-asset" label="Linked Settlement Asset" required>
                  <select
                    id="settlement-asset"
                    name="settlementAsset"
                    required
                    defaultValue="usdt"
                    className={fieldClassName}
                  >
                    <option value="usdt">USDT (Tether TRC20 / ERC20)</option>
                    <option value="btc">Bitcoin (BTC)</option>
                    <option value="eth">Ethereum (ETH)</option>
                    <option value="usdc">USDC (USD Coin)</option>
                  </select>
                </ApplicationField>
                <ApplicationField id="issuance-preference" label="Issuance Preference" required>
                  <select
                    id="issuance-preference"
                    name="issuancePreference"
                    required
                    defaultValue="instant-virtual"
                    className={fieldClassName}
                  >
                    <option value="instant-virtual">Instant Virtual Card (Apple / Google Pay)</option>
                    <option value="physical">Physical Card Delivery</option>
                    <option value="virtual-and-physical">Virtual + Physical Card</option>
                  </select>
                </ApplicationField>
                <ApplicationField
                  id="card-pin"
                  label="4-Digit ATM/POS PIN"
                  required
                  hint="4-digit security code for ATM & POS terminals."
                >
                  <input
                    id="card-pin"
                    name="cardPin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    pattern="[0-9]{4}"
                    minLength={4}
                    maxLength={4}
                    required
                    className={fieldClassName}
                    placeholder="••••"
                    title="Enter exactly four digits"
                  />
                </ApplicationField>
                <ApplicationField id="daily-spending-limit" label="Daily Spending Limit ($ USD)">
                  <input
                    id="daily-spending-limit"
                    name="dailySpendingLimit"
                    type="number"
                    min="1"
                    max={spendingLimit}
                    step="1"
                    className={fieldClassName}
                    placeholder={`Default max: ${card.limit}`}
                  />
                </ApplicationField>
                <ApplicationField
                  id="delivery-instructions"
                  label="Special Delivery Instructions"
                  optional
                  className="sm:col-span-2"
                >
                  <textarea
                    id="delivery-instructions"
                    name="deliveryInstructions"
                    rows={2}
                    className={`${fieldClassName} min-h-[60px] resize-y`}
                    placeholder="Gate access codes, courier instructions, or custom notes"
                  />
                </ApplicationField>
              </div>
            </ApplicationSection>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-6 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dash-submit inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 text-[13px] font-bold text-white focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              <CheckCircle2 size={16} /> Submit Card Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QfsCardPage() {
  const { assets, totalUsd, hasUnpricedHolding } = useWalletBalances();
  const { profile } = useUserProfile();
  const [appliedCard, setAppliedCard] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardTier | null>(null);
  const closeApplication = useCallback(() => setActiveCard(null), []);

  const usdtUsd =
    assets.find((asset) => asset.currency === "USDT")?.usdValue ?? 0;
  const cryptoUsd = Math.max(totalUsd - usdtUsd, 0);
  const totalPrefix = hasUnpricedHolding ? "≈$" : "$";
  const formatUsd = (value: number) => `${totalPrefix}${value.toFixed(2)}`;

  const fullName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const holderName = (profile?.username || fullName).trim();

  function handleApply(cardId: string) {
    const card = cardTiers.find((tier) => tier.id === cardId);
    if (card) setActiveCard(card);
  }

  function handleApplicationSubmit() {
    if (!activeCard) return;
    setAppliedCard(activeCard.id);
    setActiveCard(null);
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      {activeCard && (
        <CardApplicationModal
          card={activeCard}
          onClose={closeApplication}
          onSubmit={handleApplicationSubmit}
        />
      )}
      {appliedCard && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-[12.5px] font-bold text-emerald-800">Card application submitted</p>
            <p className="text-[12px] text-emerald-700">
              Your {cardTiers.find((c) => c.id === appliedCard)?.name ?? "card"} request is now
              pending review by our card issuance desk.
            </p>
          </div>
        </div>
      )}
      {/* Quantum Card Operations */}
      <div className="overflow-hidden rounded-[22px] bg-gradient-to-r from-[#1a1843] via-[#2a2566] to-[#3b1d6b] p-7 text-white shadow-xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
              <CreditCard size={12} /> Quantum Card Operations
            </span>
            <p className="mt-3 text-[12.5px] text-indigo-100">Total Portfolio Value</p>
            <p className="mt-0.5 text-[32px] font-black leading-none tracking-tight sm:text-[38px] lg:text-[42px]">
              {formatUsd(totalUsd)}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-indigo-200">
              <span className="font-semibold text-white">
                Available Assets: {formatUsd(totalUsd)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-300">
                USDT/Fiat: {formatUsd(usdtUsd)}
              </span>
              <span aria-hidden="true">·</span>
              <span>Crypto Holdings: {formatUsd(cryptoUsd)}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Banknote size={20} />
            </div>
            <div>
              <p className="text-[11.5px] font-semibold text-indigo-100">Account Fiat / USDT</p>
              <p className="text-[22px] font-black">{formatUsd(usdtUsd)}</p>
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
        <p className="mt-2 text-[11.5px] font-semibold text-amber-600">
          Card issuance, card funding, and card payments are not yet available. The preview below is
          illustrative only — no physical or virtual card is issued.
        </p>

        <div className="mt-5 flex flex-col items-center">
          {/* Card preview */}
          <div className="relative min-h-[200px] w-full max-w-[340px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a2540] via-[#1a3a5c] to-[#2a4a7c] p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-300">
                  Qfstier-4bwallet
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
              <button
                type="button"
                onClick={() => handleApply("visa")}
                aria-label="Apply for Visa Card"
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold"
              >
                <CreditCard size={11} /> Apply for this card
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
                <p className="font-bold">
                  {holderName ? holderName.toUpperCase() : "••••••••"}
                </p>
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

          <button
            type="button"
            onClick={() => handleApply("visa")}
            aria-label="Apply for Visa Card"
            className="dash-submit mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-bold text-white"
          >
            <CreditCard size={15} /> Apply for this card
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
                  type="button"
                  onClick={() => handleApply(card.id)}
                  aria-label={`Apply for ${card.name}`}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[12.5px] font-bold text-white transition ${card.buttonColor}`}
                >
                  Apply for Card <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfstier-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
