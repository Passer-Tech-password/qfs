
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify administrator authentication.
  const access = await requireAdmin(request);

  if (!access.ok) {
    return NextResponse.json(
      { error: access.message },
      { status: access.status }
    );
  }

  const { db } = access;

  // Get and validate search term.
  const term = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (term.length < 2 || term.length > 80) {
    return NextResponse.json(
      { error: "Enter at least 2 characters to search." },
      { status: 400 }
    );
  }

  try {
    const usersCollection = db.collection("users");

    const lower = term.toLowerCase();

    const title =
      term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();

    // Search users using multiple fields.
    const searches = [
      usersCollection
        .where("usernameLowercase", ">=", lower)
        .where("usernameLowercase", "<=", lower + "\uf8ff")
        .limit(10)
        .get(),

      usersCollection
        .where("email", ">=", lower)
        .where("email", "<=", lower + "\uf8ff")
        .limit(10)
        .get(),

      usersCollection
        .where("firstName", ">=", title)
        .where("firstName", "<=", title + "\uf8ff")
        .limit(10)
        .get(),

      usersCollection
        .where("lastName", ">=", title)
        .where("lastName", "<=", title + "\uf8ff")
        .limit(10)
        .get(),

      // Direct UID lookup.
      usersCollection.doc(term).get(),
    ];

    const results = await Promise.all(searches);

    // Remove duplicate users.
    const uniqueUsers = new Map<string, Record<string, unknown>>();

    for (const result of results) {
      const documents = "docs" in result
        ? result.docs
        : result.exists
          ? [result]
          : [];

      for (const doc of documents) {
        const data = doc.data() ?? {};

        uniqueUsers.set(doc.id, {
          uid: doc.id,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          role: data.role ?? "user",
          status: data.status ?? "active",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        users: Array.from(uniqueUsers.values()).slice(0, 30),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );

  } catch (error) {
    console.error("Admin funding user search failed:", error);

    return NextResponse.json(
      { error: "Unable to search users at this time." },
      { status: 500 }
    );
  }
}
