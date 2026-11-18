"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type Activity = {
  name: string;
  country: string;
  amount: string;
};

const activities: Activity[] = [
  { name: "Alexander Schmidt", country: "Germany", amount: "$24,000,000 USD" },
  { name: "Zhang Wei", country: "Singapore", amount: "$45,000,000 USD" },
  { name: "Emma van Dijk", country: "Netherlands", amount: "$19,600,000 USD" },
  { name: "James Okafor", country: "Nigeria", amount: "$8,250,000 USD" },
  { name: "Sofia Rossi", country: "Italy", amount: "$31,400,000 USD" },
];

export function ActivityToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % activities.length);
        setVisible(true);
      }, 400);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const activity = activities[index];

  return (
    <div
      className={`pointer-events-auto fixed bottom-5 left-5 z-30 w-[300px] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={18} className="text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Verified Withdrawal
            </span>
            <span className="ml-auto text-[10px] text-slate-400">1 min ago</span>
          </div>
          <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-800">
            {activity.name} from {activity.country}
          </p>
          <p className="mt-0.5 text-[12px] font-bold text-emerald-600">
            withdrew {activity.amount}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss notification"
          className="shrink-0 text-slate-300 transition hover:text-slate-500"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
