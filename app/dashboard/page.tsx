import { VaultHero } from "@/components/dashboard/vault-hero";
import { AvailableBalances } from "@/components/dashboard/available-balances";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FixedDepositPackages } from "@/components/dashboard/fixed-deposit-packages";
import { RunningInvestments, RecentTransactions } from "@/components/dashboard/dashboard-sections";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <VaultHero />
      <AvailableBalances />
      <QuickActions />

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FixedDepositPackages />
        <RunningInvestments />
      </div>

      <div className="mt-5">
        <RecentTransactions />
      </div>

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfstier-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
