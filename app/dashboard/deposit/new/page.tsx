import { DepositAssets } from "@/components/dashboard/deposit-assets";
import { DepositForm } from "@/components/dashboard/deposit-form";

export default function DepositNewPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <DepositAssets />
      <DepositForm />

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Quantum Finance. All rights reserved.
      </footer>
    </div>
  );
}
