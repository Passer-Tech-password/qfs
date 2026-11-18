"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/hooks/use-auth";
import { getFirebaseClients } from "@/lib/firebase/client";

type AdminState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "signed-out" }
  | { status: "not-admin" }
  | { status: "admin"; uid: string; email: string };

export function useAdmin(): AdminState {
  const auth = useAuth();
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    if (auth.status === "loading") {
      setState({ status: "loading" });
      return;
    }
    if (auth.status === "signed-out") {
      setState({ status: "signed-out" });
      return;
    }
    if (auth.status === "error") {
      setState({ status: "error", message: auth.message });
      return;
    }
    if (auth.status !== "signed-in") {
      setState({ status: "signed-out" });
      return;
    }

    const user = auth.user;
    let cancelled = false;

    async function checkAdmin() {
      try {
        const { db } = getFirebaseClients();
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        if (cancelled) return;
        if (data?.role === "admin") {
          setState({
            status: "admin",
            uid: user.uid,
            email: user.email ?? "",
          });
        } else {
          setState({ status: "not-admin" });
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Failed to verify admin access.";
        setState({ status: "error", message });
      }
    }

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  return state;
}
