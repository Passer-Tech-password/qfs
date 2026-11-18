"use client";

import { investmentPlans, type InvestmentPlan } from "@/components/dashboard/new-fixed-deposit";

export function InvestmentPlans({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (plan: InvestmentPlan) => void;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Available Investment Plans</h2>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Select any admin-configured yield tier to stake your funds.
          </p>
        </div>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11.5px] font-bold text-indigo-600">
          5 Plans Available
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {investmentPlans.map((plan) => {
          const selected = plan.id === selectedId;
          return (
            <button
              key={plan.id}
              onClick={() => onSelect(plan)}
              className={`relative rounded-2xl border p-5 text-left transition ${
                selected
                  ? "border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-indigo-300"
              }`}
            >
              {selected && (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  Selected
                </span>
              )}
              <div className="flex items-baseline gap-2">
                <h3 className="text-[16px] font-bold text-slate-900">{plan.name}</h3>
                <span className="text-[12.5px] font-bold text-indigo-600">– {plan.dailyRate}% Daily</span>
              </div>
              <p className="mt-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                {plan.days} Days Lock Period
              </p>
              <p className="mt-2 text-[12.5px] text-slate-500">{plan.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[12px]">
                <span className="text-slate-500">
                  Min Deposit: <span className="font-bold text-slate-800">${plan.min.toFixed(2)}</span>
                </span>
                <span className="text-slate-500">
                  Max Deposit: <span className="font-bold text-slate-800">${plan.max.toFixed(2)}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
