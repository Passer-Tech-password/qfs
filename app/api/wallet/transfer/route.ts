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
  resolveRecipient,
} from "@/lib/server/wallet-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NOTE_LENGTH = 300;

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
  const recipientInput =
    typeof body.recipient === "string" ? body.recipient.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const idempotencyKey = body.idempotencyKey;

  if (!isWalletCurrency(currency)) {
    return Response.json(
      { error: "Unsupported currency." },
      { status: 400 },
    );
  }

  if (!recipientInput || recipientInput.length > 320) {
    return Response.json(
      { error: "Enter a valid recipient." },
      { status: 400 },
    );
  }

  if (note.length > MAX_NOTE_LENGTH) {
    return Response.json(
      { error: "The note is too long." },
      { status: 400 },
    );
  }

  if (!isValidIdempotencyKey(idempotencyKey)) {
    return Response.json(
      { error: "Invalid transfer request identifier." },
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

  // Never trust a client-supplied recipient identity; resolve server-side.
  const counterparty = await resolveRecipient(db, recipientInput);

  if (counterparty && counterparty.uid === uid) {
    return Response.json(
      { error: "You cannot send funds to your own account." },
      { status: 400 },
    );
  }

  const amount = formatWalletAmount(amountUnits, currency);
  // Display-only human values for the transfer history table.
  const coinAmount = Number(amount);
  const rawUsdAmount =
    typeof body.usdAmount === "number" ? body.usdAmount : Number(body.usdAmount);
  const usdAmount =
    Number.isFinite(rawUsdAmount) && rawUsdAmount > 0 ? rawUsdAmount : 0;

  const senderWalletRef = db.collection("wallets").doc(uid);
  const transactionRef = db
    .collection("walletTransactions")
    .doc(`transfer_${uid}_${idempotencyKey}`);
  const senderRecordRef = db
    .collection("users")
    .doc(uid)
    .collection("transfers")
    .doc(idempotencyKey);

  const recipient = counterparty
    ? {
        ...counterparty,
        walletRef: db.collection("wallets").doc(counterparty.uid),
        transactionRef: db
          .collection("walletTransactions")
          .doc(`receive_${counterparty.uid}_${idempotencyKey}`),
        recordRef: db
          .collection("users")
          .doc(counterparty.uid)
          .collection("transfers")
          .doc(`in_${idempotencyKey}`),
        notificationRef: db.collection("userNotifications").doc(),
      }
    : null;

  try {
    const result = await db.runTransaction(async (transaction) => {
      const senderWalletSnapshot = await transaction.get(senderWalletRef);
      const existingSnapshot = await transaction.get(transactionRef);

      if (existingSnapshot.exists) {
        const existing = existingSnapshot.data()!;
        return {
          duplicate: true,
          recipient: typeof existing.recipient === "string" ? existing.recipient : recipientInput,
          external: existing.external === true,
          amount: String(existing.amount ?? amount),
          currency,
          newBalance: Number(existing.newBalanceUnits ?? 0),
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

      const recipientWalletSnapshot = recipient
        ? await transaction.get(recipient.walletRef)
        : null;

      let recipientBalances: ReturnType<typeof normalizeBalances> = null;

      if (recipient) {
        recipientBalances = normalizeBalances(
          recipientWalletSnapshot?.data()?.balances,
        );

        if (!recipientBalances) {
          throw new Error("RECIPIENT_WALLET_INVALID");
        }
      }

      const recipientNext = recipientBalances
        ? applyDelta(recipientBalances[currency], amountUnits)
        : null;

      if (recipientBalances && recipientNext === null) {
        throw new Error("BALANCE_LIMIT_EXCEEDED");
      }

      const senderWalletData = senderWalletSnapshot.data() ?? {};
      const senderBalancesNext = {
        ...senderBalances,
        [currency]: senderNext,
      };

      // Unresolved addresses are external: reserve the funds in `holds` so the
      // balance cannot be spent twice while the withdrawal is pending review.
      const senderHolds =
        normalizeBalances(senderWalletData.holds) ?? emptyWalletBalances();
      const holdsNext = recipient
        ? senderHolds
        : { ...senderHolds, [currency]: senderHolds[currency] + amountUnits };

      transaction.set(
        senderWalletRef,
        {
          userId: uid,
          balances: senderBalancesNext,
          holds: holdsNext,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      if (recipient && recipientBalances) {
        transaction.set(
          recipient.walletRef,
          {
            userId: recipient.uid,
            balances: { ...recipientBalances, [currency]: recipientNext },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        transaction.create(recipient.transactionRef, {
          userId: recipient.uid,
          counterpartyId: uid,
          type: "transfer_received",
          currency,
          amount,
          amountUnits,
          newBalance: formatWalletAmount(recipientNext!, currency),
          newBalanceUnits: recipientNext,
          status: "completed",
          idempotencyKey,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.create(recipient.recordRef, {
          direction: "in",
          asset: currency,
          symbol: currency,
          recipient: recipient.email || recipient.username,
          counterparty: uid,
          amount,
          amountUnits,
          usdAmount,
          coinAmount,
          note,
          status: "completed",
          idempotencyKey,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.create(recipient.notificationRef, {
          userId: recipient.uid,
          type: "transfer_received",
          title: "Funds received",
          message: `${amount} ${currency} was credited to your wallet.`,
          read: false,
          metadata: { currency, amount, from: uid },
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.create(transactionRef, {
        userId: uid,
        counterpartyId: recipient?.uid ?? null,
        type: recipient ? "transfer_sent" : "transfer_reserved",
        external: !recipient,
        currency,
        amount,
        amountUnits,
        previousBalance: formatWalletAmount(senderBalances[currency], currency),
        previousBalanceUnits: senderBalances[currency],
        newBalance: formatWalletAmount(senderNext, currency),
        newBalanceUnits: senderNext,
        recipient: recipientInput,
        note,
        status: recipient ? "completed" : "pending",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.create(senderRecordRef, {
        direction: "out",
        asset: currency,
        symbol: currency,
        recipient: recipientInput,
        counterparty: recipient?.uid ?? null,
        amount,
        amountUnits,
        usdAmount,
        coinAmount,
        transactionId: transactionRef.id,
        note,
        status: recipient ? "completed" : "pending",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        duplicate: false,
        recipient: recipientInput,
        external: !recipient,
        amount,
        currency,
        newBalance: senderNext,
      };
    });

    return Response.json({
      success: true,
      duplicate: result.duplicate,
      currency: result.currency,
      amount: result.amount,
      recipient: result.recipient,
      external: result.external,
      newBalance: formatWalletAmount(result.newBalance, currency),
      message: result.duplicate
        ? "This transfer was already processed."
        : result.external
          ? "Transfer reserved. It is pending review before blockchain settlement."
          : "Transfer completed successfully.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "INSUFFICIENT_FUNDS") {
      return Response.json(
        { error: "Insufficient balance for this transfer." },
        { status: 400 },
      );
    }

    if (code === "INVALID_WALLET_BALANCE" || code === "RECIPIENT_WALLET_INVALID") {
      return Response.json(
        { error: "The wallet contains invalid balance data. The transfer was cancelled." },
        { status: 409 },
      );
    }

    if (code === "BALANCE_LIMIT_EXCEEDED") {
      return Response.json(
        { error: "The transfer amount exceeds the supported range." },
        { status: 400 },
      );
    }

    console.error("Wallet transfer failed:", error);

    return Response.json(
      { error: "The transfer could not be completed. No funds were moved." },
      { status: 500 },
    );
  }
}
