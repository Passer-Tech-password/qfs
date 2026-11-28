import { FieldValue } from "firebase-admin/firestore";
import {
  formatWalletAmount,
  isWalletCurrency,
  parseWalletAmount,
} from "@/lib/server/wallet-currency";
import { requireUser } from "@/lib/server/user-api";
import {
  applyDelta,
  isValidIdempotencyKey,
  normalizeBalances,
  resolveRecipient,
} from "@/lib/server/wallet-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MERCHANT_LENGTH = 200;
const MAX_QR_LENGTH = 512;

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
  const merchantInput =
    typeof body.merchant === "string" ? body.merchant.trim() : "";
  const qrString = typeof body.qrString === "string" ? body.qrString.trim() : "";
  const idempotencyKey = body.idempotencyKey;

  if (!isWalletCurrency(currency)) {
    return Response.json({ error: "Unsupported currency." }, { status: 400 });
  }

  if (!merchantInput || merchantInput.length > MAX_MERCHANT_LENGTH) {
    return Response.json(
      { error: "Enter the merchant name or recipient ID." },
      { status: 400 },
    );
  }

  if (qrString.length > MAX_QR_LENGTH) {
    return Response.json(
      { error: "The scanned QR payload is too long." },
      { status: 400 },
    );
  }

  if (!isValidIdempotencyKey(idempotencyKey)) {
    return Response.json(
      { error: "Invalid payment request identifier." },
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

  // Never trust browser-supplied QR data: the recipient is resolved server-side
  // and must be a real QFS account before any funds move.
  const recipient = await resolveRecipient(db, merchantInput);

  if (!recipient) {
    return Response.json(
      { error: "The payment recipient could not be verified." },
      { status: 404 },
    );
  }

  if (recipient.uid === uid) {
    return Response.json(
      { error: "You cannot pay your own account." },
      { status: 400 },
    );
  }

  const amount = formatWalletAmount(amountUnits, currency);

  const senderWalletRef = db.collection("wallets").doc(uid);
  const transactionRef = db
    .collection("walletTransactions")
    .doc(`qr_${uid}_${idempotencyKey}`);
  const senderRecordRef = db
    .collection("users")
    .doc(uid)
    .collection("qrPayments")
    .doc(idempotencyKey);

  const recipientWalletRef = db.collection("wallets").doc(recipient.uid);
  const recipientTransactionRef = db
    .collection("walletTransactions")
    .doc(`qr_receive_${recipient.uid}_${idempotencyKey}`);
  const recipientRecordRef = db
    .collection("users")
    .doc(recipient.uid)
    .collection("qrPayments")
    .doc(`in_${idempotencyKey}`);
  const recipientNotificationRef = db.collection("userNotifications").doc();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const [senderWalletSnapshot, existingSnapshot] = await Promise.all([
        transaction.get(senderWalletRef),
        transaction.get(transactionRef),
      ]);

      if (existingSnapshot.exists) {
        const existing = existingSnapshot.data()!;
        return {
          duplicate: true,
          amount: String(existing.amount ?? amount),
          currency,
          merchant: String(existing.merchant ?? merchantInput),
        };
      }

      const senderBalances = normalizeBalances(
        senderWalletSnapshot.data()?.balances,
      );

      if (!senderBalances) {
        throw new Error("INVALID_WALLET_BALANCE");
      }

      const senderNext = applyDelta(senderBalances[currency], -amountUnits);

      if (senderNext === null) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const recipientWalletSnapshot = await transaction.get(recipientWalletRef);
      const recipientBalances = normalizeBalances(
        recipientWalletSnapshot.data()?.balances,
      );

      if (!recipientBalances) {
        throw new Error("RECIPIENT_WALLET_INVALID");
      }

      const recipientNext = applyDelta(recipientBalances[currency], amountUnits);

      if (recipientNext === null) {
        throw new Error("BALANCE_LIMIT_EXCEEDED");
      }

      transaction.set(
        senderWalletRef,
        {
          userId: uid,
          balances: { ...senderBalances, [currency]: senderNext },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.set(
        recipientWalletRef,
        {
          userId: recipient.uid,
          balances: { ...recipientBalances, [currency]: recipientNext },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      transaction.create(transactionRef, {
        userId: uid,
        counterpartyId: recipient.uid,
        type: "qr_payment",
        currency,
        amount,
        amountUnits,
        previousBalance: formatWalletAmount(senderBalances[currency], currency),
        previousBalanceUnits: senderBalances[currency],
        newBalance: formatWalletAmount(senderNext, currency),
        newBalanceUnits: senderNext,
        merchant: merchantInput,
        qrString,
        status: "completed",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(senderRecordRef, {
        direction: "out",
        asset: currency,
        symbol: currency,
        merchant: merchantInput,
        counterparty: recipient.uid,
        amount,
        amountUnits,
        qrString,
        status: "completed",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(recipientTransactionRef, {
        userId: recipient.uid,
        counterpartyId: uid,
        type: "qr_payment_received",
        currency,
        amount,
        amountUnits,
        newBalance: formatWalletAmount(recipientNext!, currency),
        newBalanceUnits: recipientNext,
        status: "completed",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(recipientRecordRef, {
        direction: "in",
        asset: currency,
        symbol: currency,
        merchant: recipient.email || recipient.username,
        counterparty: uid,
        amount,
        amountUnits,
        status: "completed",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(recipientNotificationRef, {
        userId: recipient.uid,
        type: "qr_payment_received",
        title: "QR payment received",
        message: `${amount} ${currency} was credited to your wallet.`,
        read: false,
        metadata: { currency, amount, from: uid },
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        duplicate: false,
        amount,
        currency,
        merchant: merchantInput,
      };
    });

    return Response.json({
      success: true,
      duplicate: result.duplicate,
      currency: result.currency,
      amount: result.amount,
      merchant: result.merchant,
      status: "completed",
      message: result.duplicate
        ? "This payment was already processed."
        : "QR payment completed successfully.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "INSUFFICIENT_FUNDS") {
      return Response.json(
        { error: "Insufficient balance for this payment." },
        { status: 400 },
      );
    }

    if (code === "INVALID_WALLET_BALANCE" || code === "RECIPIENT_WALLET_INVALID") {
      return Response.json(
        { error: "A wallet contains invalid balance data. The payment was cancelled." },
        { status: 409 },
      );
    }

    if (code === "BALANCE_LIMIT_EXCEEDED") {
      return Response.json(
        { error: "The payment amount exceeds the supported range." },
        { status: 400 },
      );
    }

    console.error("QR payment failed:", error);

    return Response.json(
      { error: "The payment could not be completed. No funds were moved." },
      { status: 500 },
    );
  }
}
