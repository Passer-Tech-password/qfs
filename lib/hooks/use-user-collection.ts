"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";
import { useAuth } from "@/lib/hooks/use-auth";

export type UserRecord = {
  id: string;
  status?: string;
  createdAt?: unknown;
  [key: string]: unknown;
};

export function useUserCollection<T = Record<string, unknown>>(subcollection: string) {
  const auth = useAuth();
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "loading") return;

    if (auth.status === "error") {
      setError(auth.message);
      setLoading(false);
      return;
    }

    if (auth.status === "signed-out") {
      setRecords([]);
      setError(null);
      setLoading(false);
      return;
    }

    let db;
    try {
      db = getFirebaseClients().db;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Firebase is not configured.");
      setLoading(false);
      return;
    }

    const recordsQuery = query(
      collection(db, "users", auth.user.uid, subcollection),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        setRecords(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setError(null);
        setLoading(false);
      },
      (caught) => {
        setError(caught.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [auth, subcollection]);

  return { records: records as (T & { id: string; status?: string; createdAt?: unknown })[], loading, error };
}
