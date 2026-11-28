import { FieldValue } from "firebase-admin/firestore";
import {
  emptyWalletBalances,
  formatWalletAmount,
  isWalletCurrency,
  parseWalletAmount,
} from "@/lib/server/wallet-currency";
import { requireUser } from "@/lib/server/user-api";
import {
  applyDelta,
  isValidIdempotencyKey,
  normalizeBalances,
} from "@/lib/server/wallet-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ADDRESS_LENGTH = 128;

export async function POST(request: Request) {
  const access = await requireUser(request);

  if (!access.ok) {
    return Response.json({ error: access.message }, { status: access.status });
  }

  let body: Record<string, unknown>;

  try {
    const parsed = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const currency = body.currency;
  const method = typeof body.method === "string" ? body.method.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const idempotencyKey = body.idempotencyKey;

  if (!isWalletCurrency(currency)) {
    return Response.json({ error: "Unsupported currency." }, { status: 400 });
  }

  if (!method || method.length > 80) {
    return Response.json({ error: "Select a valid payout method." }, { status: 400 });
  }

  if (!address || address.length > MAX_ADDRESS_LENGTH) {
    return Response.json(
      { error: "Enter a valid destination address or IBAN." },
      { status: 400 },
    );
  }

  if (!isValidIdempotencyKey(idempotencyKey)) {
    return Response.json(
      { error: "Invalid payout request identifier." },
      { status: 400 },
    );
  }

  const amountUnits = parseWalletAmount(
    typeof body.amount === "string" ? body.amount : String(body.amount ?? ""),
    currency,
  );

  if (amountUnits === null) {
    return Response.json(
      { error: `Enter a valid positive ${currency} amount.` },
      { status: 400 },
    );
  }

  const { uid, db } = access;
  const amount = formatWalletAmount(amountUnits, currency);
  // The payout history table renders a numeric amount; store the coin value.
  const amountValue = Number(amount);

  const walletRef = db.collection("wallets").doc(uid);
  const transactionRef = db
    .collection("walletTransactions")
    .doc(`payout_${uid}_${idempotencyKey}`);
  const recordRef = db
    .collection("users")
    .doc(uid)
    .collection("payouts")
    .doc(idempotencyKey);
  const auditRef = db.collection("adminAuditLogs").doc();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const [walletSnapshot, existingSnapshot] = await Promise.all([
        transaction.get(walletRef),
        transaction.get(transactionRef),
      ]);

      if (existingSnapshot.exists) {
        const existing = existingSnapshot.data()!;
        return {
          duplicate: true,
          amount: String(existing.amount ?? amount),
          currency,
        };
      }

      const walletData = walletSnapshot.data() ?? {};
      const balances = normalizeBalances(walletData.balances);

      if (!balances) {
        throw new Error("INVALID_WALLET_BALANCE");
      }

      // Reserve the funds: move them out of the spendable balance into holds
      // so a second payout cannot reserve the same units.
      const next = applyDelta(balances[currency], -amountUnits);

      if (next === null) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const holds = normalizeBalances(walletData.holds) ?? emptyWalletBalances();

      transaction.set(
        walletRef,
        {
          userId: uid,
          balances: { ...balances, [currency]: next },
          holds: { ...holds, [currency]: holds[currency] + amountUnits },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.create(transactionRef, {
        userId: uid,
        type: "payout_request",
        currency,
        amount,
        amountUnits,
        previousBalance: formatWalletAmount(balances[currency], currency),
        previousBalanceUnits: balances[currency],
        newBalance: formatWalletAmount(next, currency),
        newBalanceUnits: next,
        status: "pending",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(recordRef, {
        asset: currency,
        symbol: currency,
        method,
        address,
        amount: amountValue,
        amountUnits,
        transactionId: transactionRef.id,
        status: "pending",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(auditRef, {
        action: "wallet_payout_requested",
        adminUid: null,
        targetUserId: uid,
        currency,
        amount,
        transactionId: transactionRef.id,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { duplicate: false, amount, currency };
    });

    return Response.json({
      success: true,
      duplicate: result.duplicate,
      currency: result.currency,
      amount: result.amount,
      status: "pending",
      message: result.duplicate
        ? "This payout request was already submitted."
        : "Payout request submitted. The amount is reserved and pending review.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "INSUFFICIENT_FUNDS") {
      return Response.json(
        { error: "Insufficient balance for this payout request." },
        { status: 400 },
      );
    }

    if (code === "INVALID_WALLET_BALANCE") {
      return Response.json(
        { error: "The wallet contains invalid balance data. The payout was cancelled." },
        { status: 409 },
      );
    }

    console.error("Wallet payout request failed:", error);

    return Response.json(
      { error: "The payout request could not be submitted. No funds were reserved." },
      { status: 500 },
    );
  }
}
