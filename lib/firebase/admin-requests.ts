"use client";

import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";

/** Every per-user money-flow subcollection an admin can review. */
export const MONEY_FLOWS = [
  { key: "deposits", label: "Deposits" },
  { key: "transfers", label: "Transfers" },
  { key: "swaps", label: "Swaps" },
  { key: "fixedDeposits", label: "Fixed Deposits" },
  { key: "payouts", label: "Payouts" },
  { key: "disputes", label: "Disputes" },
  { key: "escrows", label: "Escrows" },
] as const;

export type MoneyFlowKey = (typeof MONEY_FLOWS)[number]["key"];

export type MoneyRequest = {
  id: string;
  uid: string;
  userLabel: string;
  flow: MoneyFlowKey;
  status: string;
  createdAt: unknown;
  fields: Record<string, unknown>;
};

function toMillis(value: unknown): number {
  const timestamp = value as { toMillis?: () => number; toDate?: () => Date } | null;
  if (timestamp && typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (timestamp && typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

async function loadUserIndex(db: Firestore) {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => {
    const data = d.data() as {
      firstName?: string;
      lastName?: string;
      username?: string;
      email?: string;
    };
    const name = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
    return { uid: d.id, label: name || data.username || data.email || d.id };
  });
}

/**
 * Collects every request for one flow across all users. The data lives in
 * per-user subcollections, so the admin console fans out over the `users`
 * index rather than relying on a collection-group index.
 */
export async function loadMoneyRequests(flow: MoneyFlowKey): Promise<MoneyRequest[]> {
  const { db } = getFirebaseClients();
  const users = await loadUserIndex(db);
  const results: MoneyRequest[] = [];

  await Promise.all(
    users.map(async (user) => {
      try {
        const snap = await getDocs(collection(db, "users", user.uid, flow));
        snap.docs.forEach((d) => {
          const data = d.data() as Record<string, unknown>;
          results.push({
            id: d.id,
            uid: user.uid,
            userLabel: user.label,
            flow,
            status: String(data.status ?? "pending"),
            createdAt: data.createdAt,
            fields: data,
          });
        });
      } catch {
        // Users without records simply contribute nothing.
      }
    }),
  );

  return results.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

/** Settlement is an admin status transition on a member's request record. */
export async function settleMoneyRequest(
  request: MoneyRequest,
  status: "completed" | "rejected" | "processing",
) {
  const { db } = getFirebaseClients();
  await updateDoc(doc(db, "users", request.uid, request.flow, request.id), {
    status,
    settledAt: serverTimestamp(),
  });
}
