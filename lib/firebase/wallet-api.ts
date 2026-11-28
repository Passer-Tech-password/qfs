"use client";

import { getFirebaseClients } from "@/lib/firebase/client";

/**
 * Calls a trusted wallet API route with the signed-in user's Firebase ID token.
 * The UID is always derived server-side from this token; the body never carries
 * an identity. Balances are only ever changed by these server routes.
 */
export async function postWalletAction<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { auth } = getFirebaseClients();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to continue.");
  }

  const token = await user.getIdToken();

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const result = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & Record<string, unknown>;

  if (!response.ok) {
    throw new Error(result.error || "The request could not be completed.");
  }

  return result as T;
}

export type WalletActionResult = {
  success: boolean;
  duplicate?: boolean;
  currency: string;
  amount: string;
  message: string;
  status?: string;
  [key: string]: unknown;
};
