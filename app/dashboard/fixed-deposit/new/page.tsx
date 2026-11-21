"use client";

import { useState } from "react";
import {
  FixedDepositHero,
  FixedDepositStats,
  NewFixedDepositForm,
  investmentPlans,
  type InvestmentPlan,
} from "@/components/dashboard/new-fixed-deposit";
import { InvestmentPlans } from "@/components/dashboard/investment-plans";

export default function NewFixedDepositPage() {
  const [plan, setPlan] = useState<InvestmentPlan>(investmentPlans[0]);

  return (
    <div className="mx-auto max-w-[1080px]">
      <FixedDepositHero />
      <FixedDepositStats />
      <NewFixedDepositForm plan={plan} />
      <InvestmentPlans selectedId={plan.id} onSelect={setPlan} />

      <footer className="mt-12 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfs Tier-4B. All rights reserved.
      </footer>
    </div>
  );
}
