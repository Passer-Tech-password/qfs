"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";

export type DepositAddress = {
  id: string;
  asset: string;
  symbol: string;
  network: string;
  address: string;
  memo?: string;
  rateLabel?: string;
  enabled?: boolean;
  order?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type DepositAddressInput = {
  asset: string;
  symbol: string;
  network: string;
  address: string;
  memo: string;
  rateLabel: string;
  enabled: boolean;
  order: number;
};

/**
 * Live list of the platform's deposit receiving addresses. The collection is
 * small (one doc per asset/network), so it is fetched whole and filtered in
 * memory to avoid requiring a composite index.
 */
export function useDepositAddresses() {
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let db;
    try {
      db = getFirebaseClients().db;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Firebase is not configured.");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "deposit_addresses"),
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as DepositAddress))
          .filter((a) => a.enabled !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setAddresses(list);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(caught.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { addresses, loading, error };
}

export async function saveDepositAddress(input: DepositAddressInput, id?: string) {
  const { db } = getFirebaseClients();
  if (id) {
    await updateDoc(doc(db, "deposit_addresses", id), {
      ...input,
      updatedAt: serverTimestamp(),
    });
    return id;
  }
  const ref = await addDoc(collection(db, "deposit_addresses"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function setDepositAddressEnabled(id: string, enabled: boolean) {
  const { db } = getFirebaseClients();
  await updateDoc(doc(db, "deposit_addresses", id), {
    enabled,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDepositAddress(id: string) {
  const { db } = getFirebaseClients();
  await deleteDoc(doc(db, "deposit_addresses", id));
}
