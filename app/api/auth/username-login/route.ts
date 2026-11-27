
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const invalidCredentials = () =>
  NextResponse.json(
    { error: "The username or password is incorrect. Please try again." },
    { status: 401 },
  );

export async function POST(request: Request) {
  let body: { identifier?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid sign-in request." },
      { status: 400 },
    );
  }

  const identifier =
    typeof body.identifier === "string" ? body.identifier.trim() : "";

  const password =
    typeof body.password === "string" ? body.password : "";

  if (!/^[A-Za-z0-9_]{3,30}$/.test(identifier) || !password) {
    return invalidCredentials();
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Username sign-in is not configured. Please try signing in with email.",
      },
      { status: 503 },
    );
  }

  try {
    const { getFirebaseAdmin } = await import("@/lib/firebase/admin");
    const { auth, db } = getFirebaseAdmin();

    const normalizedUsername = identifier.toLowerCase();
    const users = db.collection("users");

    let matches = await users
      .where("usernameLowercase", "==", normalizedUsername)
      .limit(2)
      .get();

    if (matches.empty) {
      matches = await users
        .where("username", "==", identifier)
        .limit(2)
        .get();
    }

    if (matches.size !== 1) return invalidCredentials();

    const profile = matches.docs[0];
    const email = profile.get("email");

    if (typeof email !== "string" || !email.includes("@")) {
      return invalidCredentials();
    }

    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
        cache: "no-store",
      },
    );

    if (!authResponse.ok) return invalidCredentials();

    const authResult = (await authResponse.json()) as {
      localId?: unknown;
    };

    if (authResult.localId !== profile.id) {
      return invalidCredentials();
    }

    // Verify email status using Firebase Admin.
    const firebaseUser = await auth.getUser(profile.id);

    if (!firebaseUser.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Your email address has not been verified. Please check your inbox and verify your email before signing in.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { email },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

  } catch (error) {
    console.error("Username sign-in failed to complete.", error);

    return NextResponse.json(
      {
        error:
          "Username sign-in is temporarily unavailable. Please try again.",
        reason: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}
