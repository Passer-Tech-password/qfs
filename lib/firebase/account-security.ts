"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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

async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pin),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Persists the 4-digit transaction PIN as a hashed, pending security record.
 * The raw PIN is never written to Firestore.
 */
export async function saveSecurityPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("Your PIN must be exactly 4 digits.");
  }
  return createAccountRecord("securityPins", { pinHash: await hashPin(pin) });
}

export type KycInput = {
  idType: string;
  idNumber: string;
  frontFileName: string | null;
  backFileName: string | null;
};

/** Submits an identity-verification (KYC) request for operator review. */
export function submitKycRequest(input: KycInput) {
  return createAccountRecord("kyc", input);
}
