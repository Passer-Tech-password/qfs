"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseClients } from "@/lib/firebase/client";

type AuthState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "signed-in"; user: User }
  | { status: "signed-out" };

// Every signed-in session is capped at five hours, measured from the moment the
// user authenticated (`auth_time`). Using the token's auth time (rather than the
// page load time) keeps the limit consistent across reloads and hourly token
// refreshes: once the window elapses the user is signed out automatically.
const SESSION_MAX_AGE_MS = 5 * 60 * 60 * 1000;
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

// Users are signed out after five minutes of inactivity (no mouse, keyboard,
// scroll, or touch input). Any of those events resets the countdown.
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseClients().auth;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Firebase is not configured.";
      setState({ status: "error", message });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState(user ? { status: "signed-in", user } : { status: "signed-out" });
      },
      (error) => {
        setState({ status: "error", message: error.message });
      },
    );

    return () => unsubscribe();
  }, []);

  // Automatically sign out every user once their five-hour session expires.
  useEffect(() => {
    if (state.status !== "signed-in") return;

    const user = state.user;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    async function forceSignOut() {
      try {
        await signOut(getFirebaseClients().auth);
      } catch {
        // Ignore failures; the layouts will still route to the login page.
      }
    }

    async function enforceSessionLimit() {
      const now = Date.now();
      let startedAt = now;
      try {
        const token = await user.getIdTokenResult();
        const authTime = token.claims.auth_time;
        if (typeof authTime === "number") startedAt = authTime * 1000;
      } catch {
        // Fall back to the current time if the token cannot be read.
      }
      if (cancelled) return;

      const expiresAt = startedAt + SESSION_MAX_AGE_MS;
      if (now >= expiresAt) {
        await forceSignOut();
        return;
      }

      interval = setInterval(() => {
        if (Date.now() >= expiresAt) {
          if (interval) clearInterval(interval);
          void forceSignOut();
        }
      }, SESSION_CHECK_INTERVAL_MS);
    }

    enforceSessionLimit();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [state]);

  // Sign the user out after INACTIVITY_TIMEOUT_MS of no activity. Any user
  // interaction (mouse, keyboard, scroll, touch, click) resets the timer.
  useEffect(() => {
    if (state.status !== "signed-in") return;

    let timer: ReturnType<typeof setTimeout>;

    async function forceSignOut() {
      try {
        await signOut(getFirebaseClients().auth);
      } catch {
        // Ignore failures; the layouts will still route to the login page.
      }
    }

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => void forceSignOut(), INACTIVITY_TIMEOUT_MS);
    }

    resetTimer();
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimer);
      }
    };
  }, [state]);

  return state;
}
