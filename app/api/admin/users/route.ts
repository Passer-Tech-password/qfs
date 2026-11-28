
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_ACTIONS = ["activate", "suspend", "block", "close", "delete"] as const;

type UserAction = (typeof USER_ACTIONS)[number];

const STATUS_BY_ACTION: Record<Exclude<UserAction, "delete">, string> = {
  activate: "active",
  suspend: "suspended",
  block: "blocked",
  close: "closed",
};

function isUserAction(value: unknown): value is UserAction {
  return (
    typeof value === "string" &&
    (USER_ACTIONS as readonly string[]).includes(value)
  );
}

export async function POST(request: Request) {
  // This endpoint is restricted to authenticated administrators.
  const access = await requireAdmin(request);

  if (!access.ok) {
    return NextResponse.json(
      { error: access.message },
      { status: access.status },
    );
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    body = parsed;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request." },
      { status: 400 },
    );
  }

  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  const action = body.action;

  if (!uid || uid.length > 128) {
    return NextResponse.json(
      { error: "Select a valid user account." },
      { status: 400 },
    );
  }

  if (!isUserAction(action)) {
    return NextResponse.json(
      { error: "Unsupported account action." },
      { status: 400 },
    );
  }

  // An administrator must not act on their own account.
  if (uid === access.adminUid) {
    return NextResponse.json(
      { error: "You cannot perform this action on your own account." },
      { status: 403 },
    );
  }

  const { auth, db, adminUid } = access;
  const userRef = db.collection("users").doc(uid);

  try {
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return NextResponse.json(
        { error: "The selected user account does not exist." },
        { status: 404 },
      );
    }

    const userData = userSnapshot.data() ?? {};
    const previousStatus =
      typeof userData.status === "string" ? userData.status : "active";

    // Other administrator accounts are protected from these actions.
    if (userData.role === "admin") {
      return NextResponse.json(
        { error: "Administrator accounts cannot be modified from this page." },
        { status: 403 },
      );
    }

    const now = Date.now();

    if (action === "delete") {
      // Permanently remove the account. The profile document and the
      // authentication record are both deleted.
      try {
        await auth.deleteUser(uid);
      } catch (error) {
        const code =
          typeof error === "object" && error !== null && "code" in error
            ? String((error as { code?: unknown }).code)
            : "";

        if (code !== "auth/user-not-found") {
          throw error;
        }
      }

      await userRef.delete();

      await db.collection("adminAuditLogs").add({
        action: "admin_user_delete",
        adminUid,
        targetUserId: uid,
        previousStatus,
        newStatus: "deleted",
        createdAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        action,
        status: "deleted",
        message: "The user account has been permanently deleted.",
        deletedAt: now,
      });
    }

    const newStatus = STATUS_BY_ACTION[action];
    const disabled = newStatus !== "active";

    // Keep the Firebase Authentication record in sync so the account cannot
    // sign in while suspended, blocked, or closed.
    try {
      await auth.updateUser(uid, { disabled });
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";

      if (code !== "auth/user-not-found") {
        throw error;
      }
    }

    await userRef.set(
      {
        status: newStatus,
        statusUpdatedAt: FieldValue.serverTimestamp(),
        statusUpdatedBy: adminUid,
      },
      { merge: true },
    );

    await db.collection("adminAuditLogs").add({
      action: `admin_user_${action}`,
      adminUid,
      targetUserId: uid,
      previousStatus,
      newStatus,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      action,
      status: newStatus,
      message:
        newStatus === "active"
          ? "The user account has been reactivated."
          : `The user account has been marked as ${newStatus}.`,
    });
  } catch (error) {
    console.error("Admin user action failed:", error);

    return NextResponse.json(
      { error: "The account action could not be completed. Please try again." },
      { status: 500 },
    );
  }
}
