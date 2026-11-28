"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/lib/hooks/use-auth";
import { getFirebaseClients } from "@/lib/firebase/client";

export type UserProfile = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  street?: string;
  status?: string;
  kycStatus?: string;
  photoURL?: string;
  createdAt?: { seconds?: number } | null;
};

export function useUserProfile() {
  const auth = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status === "loading") return;

    if (auth.status !== "signed-in") {
      setProfile(null);
      setLoading(false);
      return;
    }

    let db;
    try {
      db = getFirebaseClients().db;
    } catch {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", auth.user.uid),
      (snapshot) => {
        setProfile((snapshot.data() as UserProfile) ?? null);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsubscribe();
  }, [auth]);

  return { profile, loading };
}
