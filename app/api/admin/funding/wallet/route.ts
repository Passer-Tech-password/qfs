
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_CURRENCIES = ["USDT", "BTC", "XLM", "XRP"] as const;

export async function GET(request: NextRequest) {
  try {
    // Verify administrator authentication.
    const access = await requireAdmin(request);

    if (!access.ok) {
      return NextResponse.json(
        { error: access.message },
        { status: access.status }
      );
    }

    const { db } = access;

    // Validate requested user ID.
    const uid = request.nextUrl.searchParams.get("uid")?.trim();

    if (!uid || uid.length > 128) {
      return NextResponse.json(
        { error: "A valid user ID is required." },
        { status: 400 }
      );
    }

    // Fetch user and wallet simultaneously.
    const [userSnapshot, walletSnapshot] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("wallets").doc(uid).get(),
    ]);

    if (!userSnapshot.exists) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Read stored wallet balances.
    const storedBalances = walletSnapshot.exists
      ? walletSnapshot.get("balances") ?? {}
      : {};

    if (
      typeof storedBalances !== "object" ||
      storedBalances === null ||
      Array.isArray(storedBalances)
    ) {
      return NextResponse.json(
        { error: "Wallet contains invalid balance data." },
        { status: 409 }
      );
    }

    // Validate and normalize supported currencies.
    const balances = Object.fromEntries(
      SUPPORTED_CURRENCIES.map((currency) => {
        const value = storedBalances[currency] ?? 0;

        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          !Number.isSafeInteger(value) ||
          value < 0
        ) {
          throw new Error(`Invalid ${currency} wallet balance.`);
        }

        return [currency, value];
      })
    );

    return NextResponse.json(
      {
        success: true,
        uid,
        status: userSnapshot.get("status") ?? "active",
        balances,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Admin wallet lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to load wallet balances." },
      { status: 500 }
    );
  }
}