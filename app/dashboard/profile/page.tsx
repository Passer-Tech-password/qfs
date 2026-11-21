"use client";

import { useState } from "react";
import { Camera, ArrowLeft, LogOut, Check, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseClients } from "@/lib/firebase/client";

const darkField =
  "w-full rounded-xl border border-slate-700 bg-[#1e2235] px-4 py-3 text-[13.5px] text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-500";

export default function ProfilePage() {
  const router = useRouter();
  const [username] = useState("Cristiana456");
  const [email] = useState("Cristianalaww456@gmail.com");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      const { auth } = getFirebaseClients();
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Unable to sign out. Please try again.",
      );
      setSigningOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-[760px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Profile Settings
          </span>
          <h2 className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">
            Account Profile
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage your personal details, contact info, and profile picture.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </div>

      <div className="dash-card mt-6 p-6">
        {/* Profile Picture */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-400">
                No Photo
              </div>
              <button
                type="button"
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-2 ring-white"
              >
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900">{username}</p>
              <p className="text-[12px] text-slate-500">Member since November 2026</p>
              <p className="mt-1 text-[11.5px] text-slate-400">
                Click camera badge to change picture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-[12px] font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-wait disabled:opacity-70"
          >
            <LogOut size={14} />
            {signingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
        {signOutError && (
          <p role="alert" className="mt-3 text-[12px] font-medium text-rose-600">
            {signOutError}
          </p>
        )}

        {/* Personal Information */}
        <h3 className="mt-7 text-[15px] font-bold text-slate-900">Personal Information</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Username
            </label>
            <input
              type="text"
              value={username}
              readOnly
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Full Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full legal name"
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={darkField}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`${darkField} appearance-none pr-10`}
            >
              <option value="" className="text-slate-900">
                Select Country
              </option>
              <option value="US" className="text-slate-900">
                United States
              </option>
              <option value="GB" className="text-slate-900">
                United Kingdom
              </option>
              <option value="DE" className="text-slate-900">
                Germany
              </option>
              <option value="NG" className="text-slate-900">
                Nigeria
              </option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              className={darkField}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
            Street Address
          </label>
          <textarea
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Enter your full street address"
            rows={3}
            className={`${darkField} resize-y`}
          />
        </div>

        {/* Account Security & Compliance */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            Account Security &amp; Compliance
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2">
            <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-quantum-blink" />
              Account: Active
            </span>
            <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-quantum-blink" />
              KYC Status:{" "}
              <span className="text-amber-600">Pending</span>
            </span>
            <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-quantum-blink" />
              Joined: Nov 15, 2026
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-[13.5px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Identity Verification KYC banner */}
      <div className="mt-5 flex flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/70">
            <Shield size={20} className="text-amber-700" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-amber-900">
              Identity Verification (KYC)
            </p>
            <p className="mt-0.5 text-[12px] text-amber-800">
              Complete verification to increase your withdrawal limits and unlock institutional tier
              vaults.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/kyc"
          className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600 sm:w-auto"
        >
          Verify Identity →
        </Link>
      </div>
    </div>
  );
}
