import type { Firestore } from "firebase-admin/firestore";
import {
  WALLET_CURRENCIES,
  type WalletCurrency,
} from "@/lib/server/wallet-currency";

export const WALLET_CURRENCY_ORDER = Object.keys(
  WALLET_CURRENCIES,
) as WalletCurrency[];

export type BalanceMap = Record<WalletCurrency, number>;

/**
 * Validates and normalizes a stored wallet `balances` map.
 * Returns null when any supported currency holds a non-integer or negative
 * value, so callers can fail closed instead of trusting corrupt data.
 */
export function normalizeBalances(raw: unknown): BalanceMap | null {
  if (
    raw !== undefined &&
    (typeof raw !== "object" || raw === null || Array.isArray(raw))
  ) {
    return null;
  }

  const source = (raw ?? {}) as Record<string, unknown>;
  const balances = {} as BalanceMap;

  for (const currency of WALLET_CURRENCY_ORDER) {
    const value = source[currency] ?? 0;

    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
      return null;
    }

    balances[currency] = value;
  }

  return balances;
}

/**
 * Applies a signed integer delta to a balance, rejecting any result that is
 * negative or outside the safe integer range (double-spend / overflow guard).
 */
export function applyDelta(current: number, delta: number): number | null {
  const next = current + delta;

  if (!Number.isSafeInteger(next) || next < 0) {
    return null;
  }

  return next;
}

/** Client-supplied idempotency keys must be UUID v4 values. */
export function isValidIdempotencyKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export type ResolvedRecipient = {
  uid: string;
  email: string;
  username: string;
};

/**
 * Resolves an in-platform recipient from a UID, email address, or username.
 * Returns null when the value is not a QFS account (treated as an external
 * on-chain address by callers).
 */
export async function resolveRecipient(
  db: Firestore,
  recipient: string,
): Promise<ResolvedRecipient | null> {
  const value = recipient.trim();
  if (!value) return null;

  const toResult = (id: string, data: Record<string, unknown>) => ({
    uid: id,
    email: typeof data.email === "string" ? data.email : "",
    username: typeof data.username === "string" ? data.username : "",
  });

  // Direct UID.
  const byUid = await db.collection("users").doc(value).get();
  if (byUid.exists) {
    return toResult(byUid.id, byUid.data() ?? {});
  }

  // Email address.
  if (value.includes("@")) {
    const byEmail = await db
      .collection("users")
      .where("email", "==", value)
      .limit(1)
      .get();

    if (!byEmail.empty) {
      const doc = byEmail.docs[0];
      return toResult(doc.id, doc.data());
    }
  }

  // Username (case-insensitive).
  const byUsername = await db
    .collection("users")
    .where("usernameLowercase", "==", value.toLowerCase())
    .limit(1)
    .get();

  if (!byUsername.empty) {
    const doc = byUsername.docs[0];
    return toResult(doc.id, doc.data());
  }

  return null;
}
