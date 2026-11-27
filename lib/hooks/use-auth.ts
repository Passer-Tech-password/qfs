
"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  reload,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseClients } from "@/lib/firebase/client";

type AuthState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "signed-in"; user: User }
  | { status: "unverified"; user: User }
  | { status: "signed-out" };

const SESSION_MAX_AGE_MS = 5 * 60 * 60 * 1000;
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

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
  const [state, setState] = useState<AuthState>({
    status: "loading",
  });

  // Monitor Firebase authentication and enforce email verification.
  useEffect(() => {
    let auth;
    let active = true;

    try {
      auth = getFirebaseClients().auth;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Firebase is not configured.";

      setState({ status: "error", message });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          if (active) {
            setState({ status: "signed-out" });
          }
          return;
        }

        try {
          // Refresh Firebase user information before checking verification.
          await reload(user);

          if (!active) return;

          if (!user.emailVerified) {
            setState({
              status: "unverified",
              user,
            });
            return;
          }

          setState({
            status: "signed-in",
            user,
          });
        } catch (error) {
          if (!active) return;

          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to verify your authentication status.",
          });
        }
      },
      (error) => {
        if (active) {
          setState({
            status: "error",
            message: error.message,
          });
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Automatically sign out after five hours.
  useEffect(() => {
    if (state.status !== "signed-in") return;

    const user = state.user;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    async function forceSignOut() {
      try {
        await signOut(getFirebaseClients().auth);
      } catch {
        // Ignore sign-out failures.
      }
    }

    async function enforceSessionLimit() {
      const now = Date.now();
      let startedAt = now;

      try {
        const token = await user.getIdTokenResult();
        const authTime = token.claims.auth_time;

        if (typeof authTime === "number") {
          startedAt = authTime * 1000;
        }
      } catch {
        // Use current time as fallback.
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

    void enforceSessionLimit();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [state]);

  // Automatically sign out after five minutes of inactivity.
  useEffect(() => {
    if (state.status !== "signed-in") return;

    let timer: ReturnType<typeof setTimeout>;

    async function forceSignOut() {
      try {
        await signOut(getFirebaseClients().auth);
      } catch {
        // Ignore sign-out failures.
      }
    }

    function resetTimer() {
      clearTimeout(timer);

      timer = setTimeout(() => {
        void forceSignOut();
      }, INACTIVITY_TIMEOUT_MS);
    }

    resetTimer();

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer, {
        passive: true,
      });
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
