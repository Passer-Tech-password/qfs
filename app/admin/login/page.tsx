"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, LoaderCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";
import { Brand } from "@/components/brand";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      const { auth, db } = getFirebaseClients();
      const credential = await signInWithEmailAndPassword(auth, email, password);

      // Verify admin role
      const snap = await getDoc(doc(db, "users", credential.user.uid));
      const data = snap.data();

      if (data?.role !== "admin") {
        // Sign out immediately if not an admin
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
        setMessage({
          type: "error",
          text: "Access denied. This account does not have administrator privileges.",
        });
        return;
      }

      setMessage({ type: "success", text: "Welcome back, Admin. Redirecting…" });
      router.push("/admin");
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      const messages: Record<string, string> = {
        "auth/invalid-credential": "The email or password is incorrect.",
        "auth/user-not-found": "No admin account was found for this email.",
        "auth/wrong-password": "The email or password is incorrect.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
        "auth/network-request-failed": "Couldn't reach the server. Check your connection.",
      };
      setMessage({
        type: "error",
        text: messages[code] ?? "We couldn't sign you in. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-page flex min-h-screen flex-col px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-[980px] items-center justify-between text-[10px] text-slate-500">
        <Link className="transition hover:text-slate-800" href="/">
          ← &nbsp;Back to Home
        </Link>
        <span>
          Not an admin?{" "}
          <Link className="font-bold text-sky-700 hover:text-sky-900" href="/login">
            Member sign in →
          </Link>
        </span>
      </div>

      <section
        aria-labelledby="admin-login-title"
        className="auth-card mx-auto my-auto w-full max-w-[440px] rounded-[20px] px-6 py-8 sm:px-8 sm:py-10"
      >
        <div className="flex justify-center">
          <Brand />
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <ShieldCheck size={18} className="text-cyan-300" />
          <h1
            className="text-center text-[22px] font-extrabold tracking-tight text-white"
            id="admin-login-title"
          >
            Admin Portal
          </h1>
        </div>
        <p className="mt-1 text-center text-[11px] text-slate-300">
          Sign in to manage users, activities, and public site content.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1.5 block text-[10px] font-extrabold tracking-[0.06em] text-slate-200"
              htmlFor="admin-email"
            >
              ADMIN EMAIL
            </label>
            <span className="relative block">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <Mail size={14} />
              </span>
              <input
                autoComplete="username"
                className="auth-input min-h-11 w-full rounded-lg pl-10 pr-3 text-[12px]"
                id="admin-email"
                name="email"
                placeholder="admin@quantumfinance.com"
                required
                type="email"
              />
            </span>
          </div>

          <div>
            <label
              className="mb-1.5 block text-[10px] font-extrabold tracking-[0.06em] text-slate-200"
              htmlFor="admin-password"
            >
              PASSWORD
            </label>
            <span className="relative block">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <LockKeyhole size={14} />
              </span>
              <input
                autoComplete="current-password"
                className="auth-input min-h-11 w-full rounded-lg pl-10 pr-10 text-[12px]"
                id="admin-password"
                name="password"
                placeholder="Enter your password"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-white"
                onClick={() => setShowPassword((v) => !v)}
                type="button"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </span>
          </div>

          {message && (
            <p
              aria-live="polite"
              className={`rounded-lg border px-3 py-2.5 text-[11px] leading-relaxed ${
                message.type === "error"
                  ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
                  : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
              }`}
              role={message.type === "error" ? "alert" : "status"}
            >
              {message.text}
            </p>
          )}

          <button
            className="auth-submit inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-[12px] font-extrabold disabled:opacity-70"
            disabled={pending}
            type="submit"
          >
            {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" size={15} /> : null}
            {pending ? "Signing in…" : "Sign In as Admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-[9px] leading-relaxed text-slate-500">
          Admin access is restricted. Unauthorized attempts will be logged.
        </p>
      </section>
    </main>
  );
}
