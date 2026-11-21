import { ChartNoAxesCombined } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${compact ? "gap-1.5" : "gap-2.5"}`}>
      <ChartNoAxesCombined
        aria-hidden="true"
        className={compact ? "h-7 w-7 text-white" : "h-9 w-9 text-white"}
        strokeWidth={2.8}
      />
      <span className="flex flex-col text-left font-black leading-[0.88] tracking-[-0.06em] text-white">
        <span className={compact ? "text-[13px]" : "text-[16px]"}>Qfs</span>
        <span className={compact ? "text-[13px]" : "text-[16px]"}>Tier-4B</span>
      </span>
    </span>
  );
}
