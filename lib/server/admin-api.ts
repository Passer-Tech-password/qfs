
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export type AdminApiResult =
  | {
      ok: true;
      adminUid: string;
      auth: ReturnType<typeof getFirebaseAdmin>["auth"];
      db: ReturnType<typeof getFirebaseAdmin>["db"];
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export async function requireAdmin(
  request: Request,
): Promise<AdminApiResult> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      ok: false,
      status: 401,
      message: "Authentication required.",
    };
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Invalid authentication token.",
    };
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

    const adminSnapshot = await db
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!adminSnapshot.exists || adminSnapshot.data()?.role !== "admin") {
      return {
        ok: false,
        status: 403,
        message: "Administrator access required.",
      };
    }

    return {
      ok: true,
      adminUid: decoded.uid,
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