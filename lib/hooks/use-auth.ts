"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseClients } from "@/lib/firebase/client";

type AuthState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "signed-in"; user: User }
  | { status: "signed-out" };

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

  return state;
}
