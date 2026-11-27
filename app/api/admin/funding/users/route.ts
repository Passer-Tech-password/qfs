
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

  const { db } = access;
  const url = new URL(request.url);
  const term = (url.searchParams.get("q") ?? "").trim();

  if (term.length < 2 || term.length > 80) {
    return Response.json(
      { error: "Enter at least 2 characters to search." },
      { status: 400 },
    );
  }

  try {
    const users = db.collection("users");
    const lower = term.toLowerCase();
    const title = term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();

    const searches = [
      users
        .where("usernameLowercase", ">=", lower)
        .where("usernameLowercase", "<=", lower + "\uf8ff")
        .limit(10)
        .get(),

      users
        .where("email", ">=", lower)
        .where("email", "<=", lower + "\uf8ff")
        .limit(10)
        .get(),

      users
        .where("firstName", ">=", title)
        .where("firstName", "<=", title + "\uf8ff")
        .limit(10)
        .get(),

      users
        .where("lastName", ">=", title)
        .where("lastName", "<=", title + "\uf8ff")
        .limit(10)
        .get(),

      users.doc(term).get(),
    ];

    const results = await Promise.all(searches);
    const unique = new Map<string, Record<string, unknown>>();

    for (const result of results) {
      if ("docs" in result) {
        for (const doc of result.docs) {
          const data = doc.data();

          unique.set(doc.id, {
            uid: doc.id,
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            username: data.username ?? "",
            email: data.email ?? "",
            role: data.role ?? "user",
          });
        }
      } else if (result.exists) {
        const data = result.data()!;

        unique.set(result.id, {
          uid: result.id,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          role: data.role ?? "user",
        });
      }
    }

    return Response.json({
      users: Array.from(unique.values()).slice(0, 30),
    });
  } catch (error) {
    console.error("Admin funding user search failed:", error);

    return Response.json(
      { error: "Unable to search users at this time." },
      { status: 500 },
    );
  }
}