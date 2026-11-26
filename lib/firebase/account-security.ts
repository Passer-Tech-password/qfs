"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";

/**
 * Account-security records (security PIN, KYC submission) live in the same
 * per-user subcollection layout as money flows: the owner may only ever create
 * a `pending` entry, and settlement stays server-side.
 */
async function createAccountRecord(
  subcollection: string,
  data: Record<string, unknown>,
): Promise<string> {
  const { auth, db } = getFirebaseClients();
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("You must be signed in to continue.");
  }

  const ref = await addDoc(collection(db, "users", uid, subcollection), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Persists the 4-digit transaction PIN on the signed-in user's own database
 * record so it can be reused later. Each save appends a new record, so the
 * newest `savedAt` is treated as the active PIN.
 */
export async function saveSecurityPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("Your PIN must be exactly 4 digits.");
  }
  return createAccountRecord("securityPins", { pin, savedAt: Date.now() });
}

export type SecurityPinState = {
  /** True while the saved-PIN lookup is in flight. */
  loading: boolean;
  /** True once the account has at least one saved PIN. */
  hasPin: boolean;
  /** The saved 4-digit PIN, restored for reuse, or null when none is set. */
  pin: string | null;
  /** Epoch-ms of the most recent save, or null when no PIN exists. */
  savedAt: number | null;
  error: string | null;
};

/**
 * Live view of the signed-in account's saved security PIN. Reading from
 * Firestore (rather than component state) is what lets the PIN survive page
 * reloads, navigation, and fresh browser sessions, and update the instant a
 * new PIN is saved — so it can be reused whenever needed.
 */
export function useSecurityPin(): SecurityPinState {
  const [state, setState] = useState<SecurityPinState>({
    loading: true,
    hasPin: false,
    pin: null,
    savedAt: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    try {
      const { auth, db } = getFirebaseClients();
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setState({ loading: false, hasPin: false, pin: null, savedAt: null, error: null });
        return;
      }

      unsubscribe = onSnapshot(
        collection(db, "users", uid, "securityPins"),
        (snapshot) => {
          if (!active) return;
          let latest: { pin: string; savedAt: number } | null = null;
          for (const record of snapshot.docs) {
            const data = record.data();
            const savedPin = typeof data.pin === "string" && data.pin.length > 0 ? data.pin : null;
            if (!savedPin) continue;
            const at = typeof data.savedAt === "number" ? data.savedAt : 0;
            if (!latest || at >= latest.savedAt) latest = { pin: savedPin, savedAt: at };
          }
          setState({
            loading: false,
            hasPin: latest !== null,
            pin: latest?.pin ?? null,
            savedAt: latest?.savedAt ?? null,
            error: null,
          });
        },
        (caught) => {
          if (!active) return;
          setState({
            loading: false,
            hasPin: false,
            pin: null,
            savedAt: null,
            error: caught.message,
          });
        },
      );
    } catch (caught) {
      setState({
        loading: false,
        hasPin: false,
        pin: null,
        savedAt: null,
        error: caught instanceof Error ? caught.message : "Firebase is not configured.",
      });
      return;
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}

export type KycInput = {
  idType: string;
  idNumber: string;
  frontFile: File;
  backFile: File | null;
  confirmed: boolean;
};

export async function submitKycRequest(input: KycInput) {
  const { auth } = getFirebaseClients();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to continue.");
  }

  const token = await user.getIdToken();

  const formData = new FormData();
  formData.append("idType", input.idType);
  formData.append("idNumber", input.idNumber);
  formData.append("frontFile", input.frontFile);
  formData.append("confirmed", String(input.confirmed));

  if (input.backFile) {
    formData.append("backFile", input.backFile);
  }

  const response = await fetch("/api/kyc", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Unable to submit KYC.");
  }

  return result;
}
