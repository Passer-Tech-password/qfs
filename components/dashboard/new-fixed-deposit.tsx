import { useState } from "react";
import {
  Wallet,
  CreditCard,
  Banknote,
  DollarSign,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createFixedDeposit } from "@/lib/firebase/money";
import { useUserProfile } from "@/lib/hooks/use-user-profile";

export type InvestmentPlan = {
  id: string;
  name: string;
  dailyRate: number; // percentage, e.g. 5 for 5%
  days: number;
  min: number;
  max: number;
  description: string;
};

export const investmentPlans: InvestmentPlan[] = [
  {
    id: "starter",
    name: "Starter Plan",
    dailyRate: 5,
    days: 30,
    min: 50,
    max: 1000,
    description: "Perfect for beginners. Start with small investments.",
  },
  {
    id: "basic",
    name: "Basic Fixed Deposit",
    dailyRate: 7,
    days: 30,
    min: 200,
    max: 4999,
    description: "Perfect for beginners",
  },
  {
    id: "professional",
    name: "Professional Plan",
    dailyRate: 7,
    days: 45,
    min: 1000,
    max: 10000,
    description: "For experienced investors. Higher returns.",
  },
  {
    id: "premium",
    name: "Premium Plan",
    dailyRate: 10,
    days: 60,
    min: 10000,
    max: 100000,
    description: "Maximum returns for serious investors.",
  },
  {
    id: "vip",
    name: "VIP Plan",
    dailyRate: 12,
    days: 90,
    min: 50000,
    max: 500000,
    description: "Exclusive plan for VIP members only.",
  },
];

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: "emerald" | "indigo" | "slate";
  icon: typeof Wallet;
}) {
  const tones = {
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-600" },
    indigo: { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600", value: "text-indigo-600" },
    slate: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", value: "text-slate-900" },
  }[tone];

  return (
    <div className="dash-card flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones.icon}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11.5px] text-slate-500">{label}</p>
        <p className={`text-[17px] font-black ${tones.value}`}>{value}</p>
      </div>
    </div>
  );
}

export function FixedDepositHero() {
  return (
    <section className="dash-hero relative overflow-hidden rounded-[22px] p-6 text-white">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-wide">
            QUANTUM YIELD VAULT
          </span>
          <p className="mt-3 text-[12.5px] text-indigo-100">Investment Package</p>
          <h2 className="text-[28px] font-black leading-none tracking-tight sm:text-[34px]">Basic</h2>
          <p className="mt-1 text-[12.5px] text-indigo-200">No active investment</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-[12.5px] font-bold text-white transition hover:bg-white/20">
            <CreditCard size={15} /> My Contracts
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-bold text-indigo-700 transition hover:bg-indigo-50">
            <Wallet size={15} /> Connect Wallet
          </button>
        </div>
      </div>
    </section>
  );
}

export function FixedDepositStats() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total APY Earnings" value="+$0.00" tone="emerald" icon={Banknote} />
      <StatCard label="Daily APY Accrual" value="+$0.00/day" tone="indigo" icon={Wallet} />
      <StatCard label="Locked Capital" value="$0.00" tone="slate" icon={Banknote} />
    </div>
  );
}

export function NewFixedDepositForm({ plan }: { plan: InvestmentPlan }) {
  const { profile } = useUserProfile();
  const [amount, setAmount] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const numeric = parseFloat(amount) || 0;
  const inRange = numeric >= plan.min && numeric <= plan.max;
  const dailyProfit = inRange ? (numeric * plan.dailyRate) / 100 : 0;
  const totalReturn = inRange ? numeric + dailyProfit * plan.days : 0;
  const canSubmit = inRange && terms && !submitting;

  const username = profile?.username || "—";
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "—";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await createFixedDeposit({
        planId: plan.id,
        planName: plan.name,
        amount: numeric,
        dailyRate: plan.dailyRate,
        days: plan.days,
        dailyProfit,
        totalReturn,
      });
      setSuccess("Fixed deposit request submitted. It will appear under My Fixed Deposits once confirmed.");
      setAmount("");
      setTerms(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not create your fixed deposit.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card mt-5 p-6">
      <h3 className="text-[19px] font-bold text-slate-900">New Fixed Deposit</h3>

      <div className="mt-5 grid grid-cols-2 gap-4 border-b border-slate-100 pb-5 sm:grid-cols-4">
        <div>
          <p className="text-[11px] text-slate-500">Username</p>
          <p className="mt-0.5 text-[13.5px] font-bold text-slate-900">{username}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500">Full Name</p>
          <p className="mt-0.5 text-[13.5px] font-bold text-slate-900">{fullName}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500">Selected Plan</p>
          <p className="mt-0.5 text-[13.5px] font-bold text-indigo-600">{plan.name}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500">Available Balance</p>
          <p className="mt-0.5 text-[13.5px] font-bold text-emerald-600">$0.00</p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-slate-700" htmlFor="amount">
          Investment Amount (USDT)
        </label>
        <div className="relative">
          <DollarSign size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in USDT"
            className="dash-input w-full py-3 pl-10 pr-4 text-[14px]"
          />
        </div>
        <p className="mt-2 text-[11.5px] text-slate-500">
          Min: ${plan.min.toFixed(2)} — Max: ${plan.max.toFixed(2)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-indigo-50/70 p-5 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-400">Estimated Daily Profit</p>
          <p className="mt-1 text-[22px] font-black text-emerald-600">
            +${dailyProfit.toFixed(2)} <span className="text-[13px] font-bold text-emerald-500">/ day</span>
          </p>
          <p className="mt-1 text-[11.5px] text-slate-500">{plan.dailyRate}% Daily</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-400">Total Projected Return</p>
          <p className="mt-1 text-[22px] font-black text-indigo-600">+${totalReturn.toFixed(2)}</p>
          <p className="mt-1 text-[11.5px] text-slate-500">Over {plan.days} Days Contract</p>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-[12.5px] text-slate-600">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
        />
        I agree to the fixed deposit terms and daily yield lock schedule.
      </label>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="text-[12.5px] text-rose-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          <p className="text-[12.5px] text-emerald-700">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="dash-submit mt-5 w-full rounded-xl py-3.5 text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="animate-spin" size={16} /> Processing…
          </span>
        ) : (
          "Lock Capital & Activate Fixed Deposit"
        )}
      </button>
    </form>
  );
}
