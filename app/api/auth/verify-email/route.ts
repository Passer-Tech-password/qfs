
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);

  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      loginUrl.searchParams.set("verification", "invalid");
      return NextResponse.redirect(loginUrl);
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const { auth, db } = getFirebaseAdmin();

    const tokenRef = db
      .collection("emailVerificationTokens")
      .doc(tokenHash);

    const tokenSnapshot = await tokenRef.get();

    if (!tokenSnapshot.exists) {
      loginUrl.searchParams.set("verification", "invalid");
      return NextResponse.redirect(loginUrl);
    }

    const tokenData = tokenSnapshot.data()!;

    if (tokenData.expiresAt.toMillis() < Date.now()) {
      await tokenRef.delete();

      loginUrl.searchParams.set("verification", "expired");
      return NextResponse.redirect(loginUrl);
    }

    const user = await auth.getUser(tokenData.uid);

    if (user.email?.toLowerCase() !== tokenData.email) {
      loginUrl.searchParams.set("verification", "invalid");
      return NextResponse.redirect(loginUrl);
    }

    await auth.updateUser(tokenData.uid, {
      emailVerified: true,
    });

    await db.collection("users").doc(tokenData.uid).set(
      {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      { merge: true }
    );

    await tokenRef.delete();

    loginUrl.searchParams.set("verification", "success");

    return NextResponse.redirect(loginUrl);

  } catch (error) {
    console.error("Email verification error:", error);

    loginUrl.searchParams.set("verification", "error");

    return NextResponse.redirect(loginUrl);
  }
}
