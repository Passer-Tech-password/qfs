
"use client";

import { useState, type ChangeEvent } from "react";

import {
  FileText,
  CreditCard,
  IdCard,
  BadgeCheck,
  Camera,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { submitKycRequest } from "@/lib/firebase/account-security";

const idTypes = [
  { id: "passport", label: "Passport", icon: FileText },
  { id: "drivers", label: "Driver's License", icon: CreditCard },
  { id: "national", label: "National ID", icon: IdCard },
  { id: "permit", label: "Permit", icon: BadgeCheck },
];

export default function KycPage() {
  const [selectedId, setSelectedId] = useState("permit");
  const [idNumber, setIdNumber] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validate uploaded ID images
  function handleFileSelect(
    event: ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError(null);

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Document must not exceed 5MB.");
      return;
    }

    if (type === "front") {
      setFrontFile(file);
    } else {
      setBackFile(file);
    }
  }

  // Submit KYC request
  async function handleSubmit() {
    if (submitting) return;

    if (!idNumber.trim()) {
      setError("Enter the number printed on your ID.");
      return;
    }

    if (!frontFile) {
      setError("Please upload the front of your ID.");
      return;
    }

    if (!confirmed) {
      setError("Please confirm your information.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
await submitKycRequest({
  idType: selectedId,
  idNumber: idNumber.trim(),
  frontFile,
  backFile,
  confirmed,
});

      setSuccess(true);
      setIdNumber("");
      setFrontFile(null);
      setBackFile(null);
      setConfirmed(false);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="dash-card p-7">

        {/* Review alert */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-500"
          />
          <p className="text-[12.5px] font-medium text-amber-800">
            Your documents are under review. Submitting below will update your pending request.
          </p>
        </div>

        {/* Select ID Type */}
        <div className="mt-6">
          <label className="mb-2 block text-[12px] font-bold text-slate-700">
            Select ID Type <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {idTypes.map((t) => {
              const Icon = t.icon;
              const active = selectedId === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition ${
                    active
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <Icon
                    size={22}
                    className={
                      active
                        ? "text-violet-600"
                        : "text-slate-500"
                    }
                  />

                  <span
                    className={`text-[12.5px] font-semibold ${
                      active
                        ? "text-violet-700"
                        : "text-slate-600"
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ID Number */}
        <div className="mt-5">
          <label className="mb-2 block text-[12px] font-bold text-slate-700">
            ID Number <span className="text-rose-500">*</span>
          </label>

          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Enter the number on your ID"
            className="dash-input w-full py-2.5 px-3.5 text-[13.5px]"
          />
        </div>

        {/* Upload ID Front */}
        <div className="mt-5">
          <label className="mb-2 block text-[12px] font-bold text-slate-700">
            Upload ID Front Image{" "}
            <span className="text-rose-500">*</span>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 text-center transition hover:border-violet-300 hover:bg-violet-50/40">
            <Camera size={22} className="text-slate-400" />

            <p className="mt-2 text-[13px] font-semibold text-slate-600">
              Click to upload ID front photo
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              JPG, PNG, max 5MB
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "front")}
            />

            {frontFile && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                ✓ {frontFile.name}
              </p>
            )}
          </label>
        </div>

        {/* Upload ID Back */}
        <div className="mt-5">
          <label className="mb-2 block text-[12px] font-bold text-slate-700">
            Upload ID Back Image{" "}
            <span className="text-[11px] font-normal text-slate-400">
              (Optional)
            </span>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 text-center transition hover:border-violet-300 hover:bg-violet-50/40">
            <Camera size={22} className="text-slate-400" />

            <p className="mt-2 text-[13px] font-semibold text-slate-600">
              Click to upload ID back photo
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Leave empty if not applicable
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "back")}
            />

            {backFile && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                ✓ {backFile.name}
              </p>
            )}
          </label>
        </div>

        {/* Confirmation */}
        <label className="mt-5 flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />

          <span className="text-[12px] text-slate-600">
            I confirm that all information provided is accurate and I authorize Qfstier-4bwallet to verify my identity.
          </span>
        </label>

        {/* Error Message */}
        {error && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-rose-500"
            />

            <p className="text-[12.5px] font-medium text-rose-700">
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <p className="text-[12.5px] font-medium text-emerald-700">
              Verification submitted. Our compliance desk will review your documents shortly.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="dash-submit mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold disabled:opacity-70"
        >
          {submitting ? (
            <>
              <LoaderCircle className="animate-spin" size={16} />
              Submitting…
            </>
          ) : (
            "Submit for Review"
          )}
        </button>

      </div>
    </div>
  );
}
