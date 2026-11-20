"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";

export type RecordStatus = "pending" | "processing" | "completed" | "rejected";

/**
 * Every money flow creates a pending request record in a per-user subcollection
 * (`users/{uid}/<collection>`). Records are reviewed and settled server-side by
 * an operator; the client can only ever create `pending` entries.
 */
async function createUserRecord(
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
    status: "pending" satisfies RecordStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export type DepositInput = {
  asset: string;
  symbol: string;
  network: string;
  address: string;
  usdAmount: number;
  cryptoAmount: number;
  txHash: string;
  fileName: string | null;
};

export function createDeposit(input: DepositInput) {
  return createUserRecord("deposits", input);
}

export type TransferInput = {
  asset: string;
  symbol: string;
  network: string;
  recipient: string;
  usdAmount: number;
  coinAmount: number;
};

export function createTransfer(input: TransferInput) {
  return createUserRecord("transfers", input);
}

export type SwapInput = {
  paySymbol: string;
  receiveSymbol: string;
  payAmount: number;
  receiveAmount: number;
  rate: string;
};

export function createSwap(input: SwapInput) {
  return createUserRecord("swaps", input);
}

export type FixedDepositInput = {
  planId: string;
  planName: string;
  amount: number;
  dailyRate: number;
  days: number;
  dailyProfit: number;
  totalReturn: number;
};

export function createFixedDeposit(input: FixedDepositInput) {
  return createUserRecord("fixedDeposits", input);
}

export type PayoutInput = {
  asset: string;
  method: string;
  address: string;
  amount: number;
};

export function createPayout(input: PayoutInput) {
  return createUserRecord("payouts", input);
}

export type DisputeInput = {
  reference: string;
  subject: string;
  priority: string;
  details: string;
};

export function createDispute(input: DisputeInput) {
  return createUserRecord("disputes", input);
}

export type EscrowInput = {
  title: string;
  counterpartyEmail: string;
  currencySymbol: string;
  amount: number;
  fee: number;
  total: number;
  terms: string;
};

export function createEscrow(input: EscrowInput) {
  return createUserRecord("escrows", input);
}
