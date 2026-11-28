import { getFirebaseAdmin } from "@/lib/firebase/admin";

// Account states that may not perform financial actions.
const BLOCKED_STATUSES = new Set(["suspended", "blocked", "closed"]);

export type UserApiResult =
  | {
      ok: true;
      uid: string;
      email: string;
      auth: ReturnType<typeof getFirebaseAdmin>["auth"];
      db: ReturnType<typeof getFirebaseAdmin>["db"];
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

/**
 * Authenticates a signed-in end user from their Firebase ID token.
 * The UID always comes from the verified token, never from the request body.
 */
export async function requireUser(request: Request): Promise<UserApiResult> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { ok: false, status: 401, message: "Authentication required." };
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return { ok: false, status: 401, message: "Invalid authentication token." };
  }

  try {
    const { auth, db } = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(token, true);

    if (decoded.email_verified !== true) {
      return {
        ok: false,
        status: 403,
        message: "A verified email address is required.",
      };
    }

    const profileSnapshot = await db
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!profileSnapshot.exists) {
      return {
        ok: false,
        status: 403,
        message: "Your account profile could not be found.",
      };
    }

    const status = profileSnapshot.get("status");

    if (typeof status === "string" && BLOCKED_STATUSES.has(status)) {
      return {
        ok: false,
        status: 403,
        message: "This action is not available for your account.",
      };
    }

    return {
      ok: true,
      uid: decoded.uid,
      email: decoded.email ?? "",
      auth,
      db,
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: "Your session is invalid or has expired. Please sign in again.",
    };
  }
}
