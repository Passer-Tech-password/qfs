"use client";

import { useState } from "react";
import { DepositAssets } from "@/components/dashboard/deposit-assets";
import { DepositForm } from "@/components/dashboard/deposit-form";

export default function DepositNewPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectionVersion, setSelectionVersion] = useState(0);

  function handleSelectAsset(symbol: string) {
    setSelectedSymbol(symbol);
    setSelectionVersion((version) => version + 1);
    requestAnimationFrame(() => {
      document.getElementById("deposit-funds")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <DepositAssets onSelectAsset={handleSelectAsset} />
      <DepositForm
        selectedSymbol={selectedSymbol}
        selectionVersion={selectionVersion}
      />

      <footer className="mt-10 pb-4 text-center text-[11.5px] text-slate-400">
        © 2026 Qfsiter-4bwallet. All rights reserved.
      </footer>
    </div>
  );
}
