"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

const requiredConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firestore: Firestore | undefined;

// The SDK defaults to a streaming (WebChannel) transport, which some proxies,
// firewalls, and browser extensions silently drop. That surfaces in the console
// as "Could not reach Cloud Firestore backend ... operating in offline mode"
// and leaves every live query disconnected. Forcing long polling uses plain
// HTTPS request/response pairs that traverse those networks, so the backend is
// reachable at the cost of slightly higher update latency.
function getFirestoreClient(app: FirebaseApp): Firestore {
  if (firestore) return firestore;
  try {
    firestore = initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch {
    // A Firestore instance for this app already exists (for example after a
    // hot reload), so reuse it instead of throwing.
    firestore = getFirestore(app);
  }
  return firestore;
}

export function getFirebaseClients() {
  const missing = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* values from .env.example and restart the app.",
    );
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(requiredConfig);
  return {
    auth: getAuth(app),
    db: getFirestoreClient(app),
  };
}
