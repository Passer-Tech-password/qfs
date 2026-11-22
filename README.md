# Qfsiter-4bwallet

Responsive public landing, sign-in, and registration pages built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add the web app configuration from Firebase Console.
3. In Firebase Authentication, enable the Email/Password provider.
4. Configure `FIREBASE_ADMIN_SERVICE_ACCOUNT` with the Firebase Admin service-account JSON for username sign-in, or run the server with Google Application Default Credentials. Keep this credential server-side and never use a `NEXT_PUBLIC_` prefix for it.
5. Deploy `firestore.rules` to the Firebase project's Cloud Firestore database.
6. Start the app with `npm run dev`.

Firebase values are public client configuration and must use the `NEXT_PUBLIC_FIREBASE_` prefix. Do not put service-account credentials or private keys in this file.

Email sign-in uses Firebase Authentication directly. Username sign-in resolves the account on the server, verifies the password with Firebase Authentication, and exchanges a verified login for a Firebase custom token. The server Admin credential is required for this flow.

Registration creates a Firebase Authentication account and stores only the basic profile in `/users/{uid}`. A transaction PIN is intentionally unavailable until a trusted server-side service with appropriate rate limiting and protection is implemented. Wallet custody, live prices, transfers, and dashboard routes are not part of this first stage.
