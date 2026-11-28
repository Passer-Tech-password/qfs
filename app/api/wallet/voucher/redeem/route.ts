import { FieldValue } from "firebase-admin/firestore";
import {
  emptyWalletBalances,
  formatWalletAmount,
  isWalletCurrency,
} from "@/lib/server/wallet-currency";
import { requireUser } from "@/lib/server/user-api";
import {
  applyDelta,
  isValidIdempotencyKey,
  normalizeBalances,
} from "@/lib/server/wallet-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CODE_LENGTH = 40;

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

  const rawCode = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const idempotencyKey = body.idempotencyKey;

  if (!rawCode || rawCode.length > MAX_CODE_LENGTH) {
    return Response.json({ error: "Enter a valid voucher code." }, { status: 400 });
  }

  if (!isValidIdempotencyKey(idempotencyKey)) {
    return Response.json(
      { error: "Invalid redemption request identifier." },
      { status: 400 },
    );
  }

  const { uid, db } = access;

  const voucherRef = db.collection("vouchers").doc(rawCode);
  const redeemerWalletRef = db.collection("wallets").doc(uid);
  const transactionRef = db
    .collection("walletTransactions")
    .doc(`voucher_redeem_${uid}_${idempotencyKey}`);
  const recordRef = db
    .collection("users")
    .doc(uid)
    .collection("vouchers")
    .doc(`redeem_${idempotencyKey}`);
  const redeemerNotificationRef = db.collection("userNotifications").doc();
  const creatorNotificationRef = db.collection("userNotifications").doc();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const [voucherSnapshot, redeemerWalletSnapshot, existingSnapshot] =
        await Promise.all([
          transaction.get(voucherRef),
          transaction.get(redeemerWalletRef),
          transaction.get(transactionRef),
        ]);

      if (existingSnapshot.exists) {
        const existing = existingSnapshot.data()!;
        return {
          duplicate: true,
          amount: String(existing.amount ?? ""),
          currency: String(existing.currency ?? ""),
        };
      }

      if (!voucherSnapshot.exists) {
        throw new Error("VOUCHER_NOT_FOUND");
      }

      const voucher = voucherSnapshot.data()!;

      // Redeeming flips the voucher out of `active`; a second redemption of the
      // same code can never release the reserved funds twice.
      if (voucher.status !== "active") {
        throw new Error("ALREADY_REDEEMED");
      }

      const creatorId = typeof voucher.creatorId === "string" ? voucher.creatorId : "";
      const currency = voucher.currency;
      const amountUnits = Number(voucher.amountUnits);

      if (!creatorId || !isWalletCurrency(currency) || !Number.isSafeInteger(amountUnits) || amountUnits <= 0) {
        throw new Error("VOUCHER_INVALID");
      }

      if (creatorId === uid) {
        throw new Error("CANNOT_REDEEM_OWN");
      }

      const creatorWalletRef = db.collection("wallets").doc(creatorId);
      const creatorWalletSnapshot = await transaction.get(creatorWalletRef);

      const creatorData = creatorWalletSnapshot.data() ?? {};
      const holds = normalizeBalances(creatorData.holds) ?? emptyWalletBalances();

      if (holds[currency] < amountUnits) {
        throw new Error("HOLD_MISMATCH");
      }

      const redeemerBalances = normalizeBalances(redeemerWalletSnapshot.data()?.balances);

      if (!redeemerBalances) {
        throw new Error("INVALID_WALLET_BALANCE");
      }

      const redeemerNext = applyDelta(redeemerBalances[currency], amountUnits);

      if (redeemerNext === null) {
        throw new Error("BALANCE_LIMIT_EXCEEDED");
      }

      const amount = formatWalletAmount(amountUnits, currency);

      transaction.set(
        creatorWalletRef,
        {
          userId: creatorId,
          holds: { ...holds, [currency]: holds[currency] - amountUnits },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.set(
        redeemerWalletRef,
        {
          userId: uid,
          balances: { ...redeemerBalances, [currency]: redeemerNext },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.set(
        voucherRef,
        {
          status: "redeemed",
          redeemedBy: uid,
          redeemedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.create(transactionRef, {
        userId: uid,
        counterpartyId: creatorId,
        type: "voucher_redeemed",
        currency,
        amount,
        amountUnits,
        code: rawCode,
        status: "completed",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(recordRef, {
        direction: "in",
        asset: currency,
        symbol: currency,
        recipient: uid,
        counterparty: creatorId,
        amount,
        amountUnits,
        code: rawCode,
        status: "completed",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(redeemerNotificationRef, {
        userId: uid,
        type: "voucher_redeemed",
        title: "Voucher redeemed",
        message: `${amount} ${currency} was credited to your wallet from voucher ${rawCode}.`,
        read: false,
        metadata: { currency, amount, code: rawCode },
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(creatorNotificationRef, {
        userId: creatorId,
        type: "voucher_redeemed",
        title: "Voucher redeemed",
        message: `Your voucher ${rawCode} (${amount} ${currency}) was redeemed.`,
        read: false,
        metadata: { currency, amount, code: rawCode },
        createdAt: FieldValue.serverTimestamp(),
      });

      return { duplicate: false, amount, currency };
    });

    return Response.json({
      success: true,
      duplicate: result.duplicate,
      currency: result.currency,
      amount: result.amount,
      status: "redeemed",
      message: result.duplicate
        ? "This voucher was already redeemed."
        : `Voucher redeemed successfully. ${result.amount} ${result.currency} was credited to your wallet.`,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "VOUCHER_NOT_FOUND") {
      return Response.json({ error: "This voucher code was not found." }, { status: 404 });
    }

    if (code === "ALREADY_REDEEMED") {
      return Response.json(
        { error: "This voucher has already been redeemed." },
        { status: 409 },
      );
    }

    if (code === "CANNOT_REDEEM_OWN") {
      return Response.json(
        { error: "You cannot redeem a voucher you created." },
        { status: 400 },
      );
    }

    if (code === "VOUCHER_INVALID" || code === "HOLD_MISMATCH") {
      return Response.json(
        { error: "This voucher can no longer be redeemed. Please contact support." },
        { status: 409 },
      );
    }

    if (code === "INVALID_WALLET_BALANCE" || code === "BALANCE_LIMIT_EXCEEDED") {
      return Response.json(
        { error: "The wallet contains invalid balance data. The voucher was not redeemed." },
        { status: 409 },
      );
    }

    console.error("Voucher redemption failed:", error);

    return Response.json(
      { error: "The voucher could not be redeemed. No funds were moved." },
      { status: 500 },
    );
  }
}
