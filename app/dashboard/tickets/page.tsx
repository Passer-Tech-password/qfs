"use client";

import { useState } from "react";
import { MessageSquareMore, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export default function TicketsPage() {
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit() {
    setSuccess(false);
    if (!subject.trim()) {
      setError("Please enter a subject for your support ticket.");
      return;
    }
    if (!message.trim()) {
      setError("Please describe your issue in the message field.");
      return;
    }
    setError(null);
    setSuccess(true);
    setSubject("");
    setMessage("");
    setPriority("Normal");
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div>
        <h2 className="text-[26px] font-bold tracking-tight text-slate-900">
          Support Center
        </h2>
        <p className="mt-1 text-[13.5px] text-slate-500">
          Get help with your account and investments
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
        {/* Create New Ticket */}
        <div className="dash-card p-6">
          <h3 className="text-[18px] font-bold text-slate-900">Create New Ticket</h3>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-[12px] font-semibold text-slate-700">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder=""
                className="dash-input w-full py-2.5 px-3.5 text-[13.5px]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold text-slate-700">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="dash-input w-full appearance-none py-2.5 pl-3.5 pr-10 text-[13.5px] font-medium text-slate-800"
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold text-slate-700">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={8}
                className="dash-input w-full resize-y px-3.5 py-2.5 text-[13.5px]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
          >
            Submit Ticket
          </button>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
              <p className="text-[12.5px] font-medium text-rose-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-[12.5px] font-medium text-emerald-700">
                Your support ticket has been submitted. Our team will respond shortly.
              </p>
            </div>
          )}
        </div>

        {/* Your Support Tickets */}
        <div className="dash-card p-6">
          <h3 className="text-[18px] font-bold text-slate-900">Your Support Tickets</h3>

          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquareMore size={26} className="text-slate-400" />
            </div>
            <p className="mt-4 text-[15px] font-bold text-slate-700">No support tickets</p>
            <p className="mt-1.5 max-w-[360px] text-[12.5px] text-slate-500">
              You haven&apos;t created any support tickets yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
