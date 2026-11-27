
import { requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const access = await requireAdmin(request);

  if (!access.ok) {
    return Response.json(
      { error: access.message },
      { status: access.status },
    );
  }

  const url = new URL(request.url);
  const uid = (url.searchParams.get("uid") ?? "").trim();

  if (!uid || uid.length > 128) {
    return Response.json(
      { error: "A valid user UID is required." },
      { status: 400 },
    );
  }

  try {
    const userSnapshot = await access.db
      .collection("users")
      .doc(uid)
      .get();

    if (!userSnapshot.exists) {
      return Response.json(
        { error: "User account not found." },
        { status: 404 },
      );
    }

    const snapshot = await access.db
      .collection("walletTransactions")
      .where("userId", "==", uid)
      .where("type", "==", "admin_funding")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        currency: data.currency,
        amount: data.amount,
        previousBalance: data.previousBalance,
        newBalance: data.newBalance,
        adminUid: data.adminUid,
        note: data.note ?? "",
        status: data.status,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
      };
    });

    return Response.json({ transactions });
  } catch (error) {
    console.error("Admin funding history failed:", error);

    return Response.json(
      { error: "Unable to load funding history." },
      { status: 500 },
    );
  }
}