
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/server/admin-api";
import {
  formatWalletAmount,
  isWalletCurrency,
  parseWalletAmount,
} from "@/lib/server/wallet-currency";

export const runtime = "nodejs";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

type FundingResult = {
  duplicate: boolean;
  transactionId: string;
  amount: string;
  currency: string;
  previousBalance: string;
  newBalance: string;
};

export async function POST(request: Request) {
  const access = await requireAdmin(request);

  if (!access.ok) {
    return Response.json(
      { error: access.message },
      { status: access.status },
    );
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    body = parsed;
  } catch {
    return Response.json(
      { error: "Invalid JSON request." },
      { status: 400 },
    );
  }

  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  const currency = body.currency;
  const amountInput = body.amount;
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const idempotencyKey =
    typeof body.idempotencyKey === "string"
      ? body.idempotencyKey.trim()
      : "";

  if (!uid || uid.length > 128) {
    return Response.json(
      { error: "Select a valid user account." },
      { status: 400 },
    );
  }

  if (!isWalletCurrency(currency)) {
    return Response.json(
      { error: "Unsupported wallet currency." },
      { status: 400 },
    );
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idempotencyKey,
    )
  ) {
    return Response.json(
      { error: "Invalid funding request identifier." },
      { status: 400 },
    );
  }

  if (note.length > 300) {
    return Response.json(
      { error: "The funding note cannot exceed 300 characters." },
      { status: 400 },
    );
  }

  const amountUnits = parseWalletAmount(amountInput, currency);

  if (amountUnits === null) {
    return Response.json(
      {
        error: `Enter a valid positive ${currency} amount with no more than the permitted decimal places.`,
      },
      { status: 400 },
    );
  }

  const { db, adminUid } = access;

  const userRef = db.collection("users").doc(uid);
  const walletRef = db.collection("wallets").doc(uid);
  const transactionRef = db
    .collection("walletTransactions")
    .doc(`fund_${idempotencyKey}`);
  const rateRef = db
    .collection("adminFundingRateLimits")
    .doc(adminUid);
  const auditRef = db.collection("adminAuditLogs").doc();
  const notificationRef = db.collection("userNotifications").doc();

  try {
    const result = await db.runTransaction(async (transaction) => {
      // All reads must happen before writes in a Firestore transaction.
      const [
        userSnapshot,
        walletSnapshot,
        existingTransaction,
        rateSnapshot,
      ] = await Promise.all([
        transaction.get(userRef),
        transaction.get(walletRef),
        transaction.get(transactionRef),
        transaction.get(rateRef),
      ]);

      if (!userSnapshot.exists) {
        throw new Error("USER_NOT_FOUND");
      }

      if (existingTransaction.exists) {
        const existing = existingTransaction.data()!;

        const sameRequest =
          existing.userId === uid &&
          existing.adminUid === adminUid &&
          existing.currency === currency &&
          existing.amountUnits === amountUnits;

        if (!sameRequest) {
          throw new Error("IDEMPOTENCY_CONFLICT");
        }

        return {
          duplicate: true,
          transactionId: transactionRef.id,
          amount: existing.amount,
          currency: existing.currency,
          previousBalance: existing.previousBalance,
          newBalance: existing.newBalance,
        } satisfies FundingResult;
      }

      const walletData = walletSnapshot.data() ?? {};
      const storedBalances = walletData.balances ?? {};

      const balances: Record<string, number> = {
        ...storedBalances,
        USDT: storedBalances.USDT ?? 0,
        BTC: storedBalances.BTC ?? 0,
        XLM: storedBalances.XLM ?? 0,
        XRP: storedBalances.XRP ?? 0,
      };

      for (const supportedCurrency of ["USDT", "BTC", "XLM", "XRP"]) {
        const value = balances[supportedCurrency];

        if (!Number.isSafeInteger(value) || value < 0) {
          throw new Error("INVALID_WALLET_BALANCE");
        }
      }

      const previousUnits = balances[currency];

      if (!Number.isSafeInteger(previousUnits + amountUnits)) {
        throw new Error("BALANCE_LIMIT_EXCEEDED");
      }

      const newUnits = previousUnits + amountUnits;

      const now = Date.now();
      const rateData = rateSnapshot.data();
      const previousWindow = rateData?.windowStartedAt;

      const windowStart =
        previousWindow instanceof Timestamp
          ? previousWindow.toMillis()
          : 0;

      const currentCount =
        windowStart > 0 && now - windowStart < RATE_WINDOW_MS
          ? Number(rateData?.count ?? 0)
          : 0;

      if (currentCount >= RATE_LIMIT) {
        throw new Error("RATE_LIMIT");
      }

      balances[currency] = newUnits;

      const formattedAmount = formatWalletAmount(amountUnits, currency);
      const previousBalance = formatWalletAmount(previousUnits, currency);
      const newBalance = formatWalletAmount(newUnits, currency);

      const userData = userSnapshot.data()!;

      transaction.set(
        walletRef,
        {
          userId: uid,
          balances,
          createdAt: walletData.createdAt ?? FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.create(transactionRef, {
        userId: uid,
        adminUid,
        type: "admin_funding",
        currency,
        amount: formattedAmount,
        amountUnits,
        previousBalance,
        previousBalanceUnits: previousUnits,
        newBalance,
        newBalanceUnits: newUnits,
        note,
        status: "completed",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(auditRef, {
        action: "admin_wallet_funding",
        adminUid,
        targetUserId: uid,
        currency,
        amount: formattedAmount,
        transactionId: transactionRef.id,
        note,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(notificationRef, {
        userId: uid,
        type: "wallet_funding",
        title: "Wallet funded",
        message: `${formattedAmount} ${currency} has been credited to your wallet.`,
        read: false,
        metadata: {
          transactionId: transactionRef.id,
          currency,
          amount: formattedAmount,
        },
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.set(rateRef, {
        adminUid,
        windowStartedAt:
          currentCount > 0
            ? previousWindow
            : Timestamp.fromMillis(now),
        count: currentCount + 1,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Do not expose the user's private profile data.
      void userData;

      return {
        duplicate: false,
        transactionId: transactionRef.id,
        amount: formattedAmount,
        currency,
        previousBalance,
        newBalance,
      } satisfies FundingResult;
    });

    return Response.json({
      success: true,
      message: result.duplicate
        ? "This funding request was already processed."
        : "Wallet funded successfully.",
      ...result,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "USER_NOT_FOUND") {
      return Response.json(
        { error: "The selected user account does not exist." },
        { status: 404 },
      );
    }

    if (code === "IDEMPOTENCY_CONFLICT") {
      return Response.json(
        { error: "This request identifier was already used for a different funding operation." },
        { status: 409 },
      );
    }

    if (code === "INVALID_WALLET_BALANCE") {
      return Response.json(
        { error: "The existing wallet contains an invalid balance. Funding was not applied." },
        { status: 409 },
      );
    }

    if (code === "BALANCE_LIMIT_EXCEEDED") {
      return Response.json(
        { error: "The resulting balance exceeds the supported safe numeric range." },
        { status: 400 },
      );
    }

    if (code === "RATE_LIMIT") {
      return Response.json(
        { error: "Funding rate limit reached. Please wait one minute before trying again." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }

    console.error("Admin wallet funding failed:", error);

    return Response.json(
      { error: "Funding could not be completed. No balance change was confirmed." },
      { status: 500 },
    );
  }
}