import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const appName = "username-login";

function getAdminApp() {
  const existing = getApps().find((app) => app.name === appName);
  if (existing) return existing;

  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  const credential = serviceAccountJson
    ? cert(
        JSON.parse(serviceAccountJson, (_key, value) =>
          typeof value === "string" ? value.replace(/\\n/g, "\n") : value,
        ) as ServiceAccount,
      )
    : applicationDefault();

  return initializeApp(
    {
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    appName,
  );
}

export function getFirebaseAdmin() {
  const app = getAdminApp();
  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
