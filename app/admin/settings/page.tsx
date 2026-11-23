"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Shield,
  Bell,
  Globe,
  Database,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [toast, setToast] = useState<string | null>(null);

  function handleSave() {
    setToast("Settings saved successfully.");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <SettingsIcon size={20} />
        </span>
        <div>
          <h2 className="text-[18px] font-bold text-slate-900">Admin Settings</h2>
          <p className="text-[12px] text-slate-500">Configure platform-wide preferences.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform settings */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-indigo-600" />
            <h3 className="text-[15px] font-bold text-slate-900">Platform Settings</h3>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Platform Name
              </label>
              <input defaultValue="Qfstier-4bwallet" className="dash-input h-11 w-full px-4 text-[13px]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Support Email
              </label>
              <input defaultValue="support@example.com" className="dash-input h-11 w-full px-4 text-[13px]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Default Currency
              </label>
              <select defaultValue="USD" className="dash-input h-11 w-full px-4 text-[13px]">
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security settings */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-rose-600" />
            <h3 className="text-[15px] font-bold text-slate-900">Security Settings</h3>
          </div>
          <div className="mt-5 space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[13px] font-medium text-slate-700">Require 2FA for admins</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[13px] font-medium text-slate-700">Email alerts for failed logins</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[13px] font-medium text-slate-700">Auto-suspend after 5 failed attempts</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-amber-600" />
            <h3 className="text-[15px] font-bold text-slate-900">Notifications</h3>
          </div>
          <div className="mt-5 space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[13px] font-medium text-slate-700">New user registration</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[13px] font-medium text-slate-700">Large transactions</span>
              <input type="checkbox" className="h-4 w-4 accent-indigo-600" />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[13px] font-medium text-slate-700">Support tickets</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
            </label>
          </div>
        </div>

        {/* Database / System */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-emerald-600" />
            <h3 className="text-[15px] font-bold text-slate-900">System</h3>
          </div>
          <div className="mt-5 space-y-3 text-[12px] text-slate-600">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span>Firestore</span>
              <span className="font-bold text-emerald-600">Connected</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span>Firebase Auth</span>
              <span className="font-bold text-emerald-600">Connected</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span>Storage</span>
              <span className="font-bold text-slate-500">Not configured</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105"
        >
          <Save size={15} /> Save Settings
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
