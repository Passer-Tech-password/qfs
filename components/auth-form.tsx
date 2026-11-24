"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";
import { Brand } from "@/components/brand";

type AuthMode = "login" | "register";

function firebaseMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  const messages: Record<string, string> = {
    "auth/invalid-credential": "The email or password is incorrect. Please try again.",
    "auth/user-not-found": "No account was found for this email address.",
    "auth/wrong-password": "The email or password is incorrect. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Please wait a little while and try again.",
    "auth/network-request-failed": "We couldn't reach Firebase. Check your connection and try again.",
  };

  if (error instanceof Error && !code) return error.message;
  return messages[code] ?? "We couldn't complete that request. Please try again.";
}

// A stale or partially cached JS bundle can leave an older Firebase runtime in
// memory, so the auth module never registers and getAuth() throws
// "Component auth has not been registered yet".
function isStaleBundleError(error: unknown) {
  return error instanceof Error && /has not been registered yet/i.test(error.message);
}

function Field({
  label,
  icon,
  children,
  id,
  className = "",
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  id: string;
  className?: string;
}) {
  return (
    <div className={`block min-w-0 ${className}`}>
      <label className="mb-1.5 block text-[9px] font-extrabold tracking-[0.06em] text-slate-200 sm:text-[10px]" htmlFor={id}>
        {label}
      </label>
      <span className="relative block">
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        {children}
      </span>
    </div>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";
  const inputClass = isRegister
    ? "auth-input min-h-12 w-full rounded-xl pl-11 pr-4 text-[14px]"
    : "auth-input min-h-10 w-full rounded-lg pl-9 pr-3 text-[11px] sm:text-[12px]";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const identifier = String(form.get("identifier") ?? "").trim();

    try {
      const { auth, db } = getFirebaseClients();

      if (!isRegister) {
        const password = String(form.get("password") ?? "");
        if (identifier.includes("@")) {
          await signInWithEmailAndPassword(auth, identifier.toLowerCase(), password);
        } else {
          if (!/^[A-Za-z0-9_]{3,30}$/.test(identifier)) {
            setMessage({
              type: "error",
              text: "Enter a valid username (3–30 letters, numbers, or underscores) or email address.",
            });
            return;
          }

          const response = await fetch("/api/auth/username-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
          });
          const result = (await response.json().catch(() => null)) as
            | { customToken?: string; error?: string }
            | null;

          if (!response.ok || !result?.customToken) {
            setMessage({
              type: "error",
              text: result?.error ?? "The username or password is incorrect. Please try again.",
            });
            return;
          }

          await signInWithCustomToken(auth, result.customToken);
        }
        const next = new URLSearchParams(window.location.search).get("next");
        router.push(next === "/dashboard/security" ? next : "/dashboard");
        return;
      }

      const password = String(form.get("password") ?? "");
      const firstName = String(form.get("firstName") ?? "").trim();
      const lastName = String(form.get("lastName") ?? "").trim();
      const username = String(form.get("username") ?? "").trim();
      const phoneNumber = String(form.get("phoneNumber") ?? "").trim();
      const confirmation = String(form.get("confirmPassword") ?? "");

      if (password !== confirmation) {
        setMessage({ type: "error", text: "Your passwords don't match. Please check and try again." });
        return;
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Save the user profile to Firestore first — this is the critical step
      // that allows username-based login and dashboard access. It runs
      // independently of updateProfile so a profile-display failure can never
      // leave the account without a saved record.
      try {
        await setDoc(doc(db, "users", credential.user.uid), {
          firstName,
          lastName,
          username,
          usernameLowercase: username.toLowerCase(),
          phoneNumber,
          email,
          createdAt: serverTimestamp(),
        });
      } catch (saveError) {
        console.error("Failed to save user profile to Firestore.", saveError);
        setMessage({
          type: "error",
          text: "Your account was created, but we couldn't save its profile. You can sign in while the profile setup is resolved.",
        });
        return;
      }

      // Updating the display name is a nice-to-have and must not block the
      // account from being usable, so failures here are swallowed.
      try {
        await updateProfile(credential.user, { displayName: `${firstName} ${lastName}` });
      } catch {
        // Non-fatal — the Firestore profile is already saved.
      }

      setMessage({
        type: "success",
        text: "Your QFS account is ready. Taking you to your dashboard…",
      });
      formElement.reset();
      router.push("/dashboard");
    } catch (error) {
      if (isStaleBundleError(error) && sessionStorage.getItem("qfs-stale-bundle-reload") !== "1") {
        sessionStorage.setItem("qfs-stale-bundle-reload", "1");
        setMessage({
          type: "error",
          text: "Secure services didn't finish loading on this page. Refreshing to load the latest version…",
        });
        window.location.reload();
        return;
      }
      setMessage({ type: "error", text: firebaseMessage(error) });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={isRegister ? "auth-register-form mt-7 space-y-5" : "mt-5 space-y-3.5"} onSubmit={handleSubmit}>
      {isRegister && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <Field id="firstName" label="FIRST NAME" icon={<UserRound size={13} />}>
            <input autoComplete="given-name" className={inputClass} id="firstName" maxLength={60} name="firstName" placeholder="Enter first name" required />
          </Field>
          <Field id="lastName" label="LAST NAME" icon={<UserRound size={13} />}>
            <input autoComplete="family-name" className={inputClass} id="lastName" maxLength={60} name="lastName" placeholder="Enter last name" required />
          </Field>
          <Field id="username" label="USERNAME" icon={<AtSign size={13} />}>
            <input autoComplete="username" className={inputClass} id="username" maxLength={30} minLength={3} name="username" pattern="[A-Za-z0-9_]{3,30}" placeholder="Choose a username" required />
            <span className="mt-1.5 block text-[10px] font-medium leading-relaxed text-slate-400">3–30 letters, numbers, or underscores</span>
          </Field>
          <Field id="securityPin" label="4-DIGIT SECURITY PIN" icon={<KeyRound size={13} />}>
            <input aria-describedby="pin-help" className={`${inputClass} cursor-not-allowed opacity-70`} disabled id="securityPin" inputMode="numeric" placeholder="Set up after account creation" />
            <span className="mt-1.5 block text-[10px] font-medium leading-relaxed text-slate-400" id="pin-help">
              Transaction PIN setup requires a secure service and is not enabled yet.
            </span>
          </Field>
          <Field id="registerEmail" label="EMAIL ADDRESS" icon={<Mail size={13} />}>
            <input autoComplete="email" className={inputClass} id="registerEmail" name="email" placeholder="Enter your email" required type="email" />
          </Field>
          <Field id="phoneNumber" label="PHONE NUMBER" icon={<Phone size={13} />}>
            <input autoComplete="tel" className={inputClass} id="phoneNumber" maxLength={24} name="phoneNumber" placeholder="Enter your phone" required type="tel" />
          </Field>
          <Field id="registerPassword" label="PASSWORD" icon={<LockKeyhole size={13} />} className="sm:col-span-2">
            <input autoComplete="new-password" className={`${inputClass} pr-10`} id="registerPassword" minLength={8} name="password" placeholder="Create a password" required type={showPassword ? "text" : "password"} />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-white"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <span className="mt-1.5 block text-[10px] font-medium leading-relaxed text-slate-400">Use at least 8 characters.</span>
          </Field>
          <Field id="confirmPassword" label="CONFIRM PASSWORD" icon={<LockKeyhole size={13} />} className="sm:col-span-2">
            <input autoComplete="new-password" className={`${inputClass} pr-10`} id="confirmPassword" minLength={8} name="confirmPassword" placeholder="Re-enter your password" required type={showPassword ? "text" : "password"} />
          </Field>
        </div>
      )}

      {!isRegister && (
        <>
          <Field id="loginIdentifier" label="USERNAME OR EMAIL" icon={<UserRound size={14} />}>
            <input autoComplete="username" className={inputClass} id="loginIdentifier" name="identifier" placeholder="Enter your username or email" required type="text" />
          </Field>
          <Field id="loginPassword" label="PASSWORD" icon={<LockKeyhole size={14} />}>
            <input autoComplete="current-password" className={inputClass} id="loginPassword" name="password" placeholder="Enter your password" required type="password" />
          </Field>
        </>
      )}

      {isRegister && (
        <label className="flex cursor-pointer items-start gap-3 text-[12px] font-semibold leading-relaxed text-slate-300">
          <input className="mt-0.5 accent-cyan-400" defaultChecked name="terms" required type="checkbox" />
          <span>
            I agree to the{" "}
            <span className="bg-gradient-to-r from-[#05dce9] to-[#43a8ff] bg-clip-text font-semibold text-transparent">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="bg-gradient-to-r from-[#05dce9] to-[#43a8ff] bg-clip-text font-semibold text-transparent">
              Privacy Policy
            </span>
            .
          </span>
        </label>
      )}

      {message && (
        <p
          aria-live="polite"
          className={`rounded-lg border px-3 py-2.5 text-[10px] leading-relaxed ${
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
        className={isRegister
          ? "auth-submit inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-extrabold disabled:opacity-70"
          : "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-4 text-[11px] font-extrabold text-white shadow-lg shadow-violet-600/30 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        }
        disabled={pending}
        type="submit"
      >
        {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" size={15} /> : null}
        {pending ? "Please wait..." : isRegister ? "Create a QFS Account" : "Sign In"}
        {!pending && !isRegister ? <span aria-hidden="true">→</span> : null}
        {!pending && isRegister ? <span aria-hidden="true">→</span> : null}
      </button>

      <p className={isRegister ? "text-center text-[12px] font-semibold text-slate-300" : "text-center text-[10px] text-slate-300"}>
        {isRegister ? "Already have an account? " : "Don't have an account? "}
        <Link className="bg-gradient-to-r from-[#05dce9] to-[#43a8ff] bg-clip-text font-extrabold text-transparent" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Sign in here" : "Create Account"}
        </Link>
      </p>
    </form>
  );
}

export function AuthCard({ mode }: { mode: AuthMode }) {
  const isRegister = mode === "register";

  return (
    <main className={`auth-page flex min-h-screen flex-col px-4 py-6 sm:px-6 sm:py-8 ${isRegister ? "auth-register-page" : ""}`}>
      <div className={`mx-auto flex w-full max-w-[980px] items-center justify-between gap-4 text-[11px] sm:text-[12px] ${isRegister ? "text-slate-400" : "text-slate-500"}`}>
        <Link className={isRegister ? "shrink-0 font-bold text-slate-300 transition hover:text-white" : "shrink-0 font-semibold transition hover:text-slate-800"} href="/">← &nbsp;Back to Home</Link>
        <span className={`text-right font-semibold ${isRegister ? "text-slate-300" : ""}`}>
          {isRegister ? "Already registered? " : "New to QFS? "}
          <Link
            className={isRegister
              ? "bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text font-extrabold text-transparent"
              : "bg-gradient-to-r from-[#05dce9] to-[#43a8ff] bg-clip-text font-extrabold text-transparent"}
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "Sign in →" : "Create account →"}
          </Link>
        </span>
      </div>

      <section
        aria-labelledby="auth-title"
        className={`${isRegister ? "auth-register-card" : "auth-card"} mx-auto my-auto w-full ${
          isRegister
            ? "max-w-[720px] rounded-2xl px-5 py-6 sm:rounded-3xl sm:px-9 sm:py-9"
            : "max-w-[440px] rounded-[20px] px-6 py-7 sm:px-8 sm:py-8"
        }`}
      >
        <div className="flex justify-center">
          <Brand />
        </div>
        <h1 className={`mt-5 text-center font-black tracking-tight text-white ${isRegister ? "text-[28px] sm:text-[32px]" : "text-[21px] sm:text-[24px]"}`} id="auth-title">
          {isRegister ? "Create Account" : "Sign in to your QFS account"}
        </h1>
        <p className={`mt-2 text-center ${isRegister ? "text-[13px] font-medium leading-relaxed text-slate-300 sm:text-[14px]" : "text-[10px] text-slate-300 sm:text-[11px]"}`}>
          {isRegister
            ? "Join Qfstier-4bwallet and explore the digital asset experience."
            : "Access your crypto balances, institutional vault & transactions"}
        </p>
        <AuthForm mode={mode} />
      </section>

      <p className={`mx-auto mt-6 max-w-[600px] text-center leading-relaxed ${isRegister ? "text-[10px] font-medium text-slate-400 sm:text-[11px]" : "text-[9px] text-slate-500"}`}>
        {isRegister
          ? "Asset custody, transaction PINs, and payment services are not active on this preview."
          : "Wallet connections and transfers are not active on this preview."}
      </p>
    </main>
  );
}
