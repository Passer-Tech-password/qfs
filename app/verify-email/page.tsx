
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseClients } from "@/lib/firebase/client";
import { MailCheck, LogOut } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut(getFirebaseClients().auth);
    } finally {
      router.replace("/login");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d1c] px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-[#101a30] p-7 text-center shadow-2xl sm:p-9">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
          <MailCheck size={32} />
        </div>

        <h1 className="mt-6 text-2xl font-black text-white">
          Verify Your Email
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          Your Qfstier-4bwallet account requires email verification
          before you can access your dashboard.
        </p>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Please open the verification message sent to your registered
          email address and click the Verify Email Address button.
        </p>

        <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-xs leading-6 text-cyan-200">
          Your verification link expires after 24 hours.
          Check your spam or junk folder if you cannot find the message.
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 text-sm font-bold text-white transition hover:brightness-110"
        >
          <LogOut size={16} />
          Return to Sign In
        </button>

        <p className="mt-6 text-[11px] text-slate-500">
          Qfstier-4bwallet · Account Security
        </p>

      </section>
    </main>
  );
}
