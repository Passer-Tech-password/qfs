import { randomBytes } from "crypto";
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

const MAX_NOTE_LENGTH = 300;
const MAX_EMAIL_LENGTH = 320;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateVoucherCode(): string {
  const bytes = randomBytes(12);
  let out = "";

  for (let index = 0; index < 12; index += 1) {
    out += CODE_ALPHABET[bytes[index] % CODE_ALPHABET.length];
  }

  return `QFS-${out.slice(0, 6)}-${out.slice(6)}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const recipientEmail =
    typeof body.recipientEmail === "string" ? body.recipientEmail.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const idempotencyKey = body.idempotencyKey;

  if (!isWalletCurrency(currency)) {
    return Response.json({ error: "Unsupported currency." }, { status: 400 });
  }

  if (
    recipientEmail &&
    (recipientEmail.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(recipientEmail))
  ) {
    return Response.json(
      { error: "Enter a valid recipient email address." },
      { status: 400 },
    );
  }

  if (note.length > MAX_NOTE_LENGTH) {
    return Response.json(
      { error: "The voucher note is too long." },
      { status: 400 },
    );
  }

  if (!isValidIdempotencyKey(idempotencyKey)) {
    return Response.json(
      { error: "Invalid voucher request identifier." },
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

  const walletRef = db.collection("wallets").doc(uid);
  const transactionRef = db
    .collection("walletTransactions")
    .doc(`voucher_${uid}_${idempotencyKey}`);
  const recordRef = db
    .collection("users")
    .doc(uid)
    .collection("vouchers")
    .doc(idempotencyKey);
  const notificationRef = db.collection("userNotifications").doc();

  // Retry only when a freshly generated code collides with an existing voucher.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = generateVoucherCode();
    const voucherRef = db.collection("vouchers").doc(code);

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
            code: typeof existing.code === "string" ? existing.code : "",
          };
        }

        const walletData = walletSnapshot.data() ?? {};
        const balances = normalizeBalances(walletData.balances);

        if (!balances) {
          throw new Error("INVALID_WALLET_BALANCE");
        }

        // Reserve the voucher value: move it out of the spendable balance into
        // holds so the same units cannot back a second voucher or payout.
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

        transaction.create(voucherRef, {
          code,
          creatorId: uid,
          currency,
          amount,
          amountUnits,
          recipientEmail: recipientEmail || null,
          note,
          status: "active",
          reserved: true,
          idempotencyKey,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.create(transactionRef, {
          userId: uid,
          type: "voucher_created",
          currency,
          amount,
          amountUnits,
          previousBalance: formatWalletAmount(balances[currency], currency),
          previousBalanceUnits: balances[currency],
          newBalance: formatWalletAmount(next, currency),
          newBalanceUnits: next,
          code,
          status: "completed",
          idempotencyKey,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.create(recordRef, {
          asset: currency,
          symbol: currency,
          amount,
          amountUnits,
          recipientEmail: recipientEmail || null,
          note,
          code,
          status: "pending",
          idempotencyKey,
          createdAt: FieldValue.serverTimestamp(),
        });

        transaction.create(notificationRef, {
          userId: uid,
          type: "voucher_created",
          title: "Voucher created",
          message: `A ${amount} ${currency} voucher was created and reserved from your balance.`,
          read: false,
          metadata: { currency, amount, code },
          createdAt: FieldValue.serverTimestamp(),
        });

        return { duplicate: false, amount, currency, code };
      });

      return Response.json({
        success: true,
        duplicate: result.duplicate,
        currency: result.currency,
        amount: result.amount,
        code: result.code,
        status: "active",
        message: result.duplicate
          ? "This voucher was already created."
          : "Voucher created successfully.",
      });
    } catch (error) {
      const code = (error as { code?: number | string })?.code;
      const message = error instanceof Error ? error.message : "";

      if (code === 6 || code === "already-exists" || message === "ALREADY_EXISTS") {
        // Voucher code collision — generate a new code and retry.
        continue;
      }

      if (message === "INSUFFICIENT_FUNDS") {
        return Response.json(
          { error: "Insufficient balance to create this voucher." },
          { status: 400 },
        );
      }

      if (message === "INVALID_WALLET_BALANCE") {
        return Response.json(
          { error: "The wallet contains invalid balance data. The voucher was not created." },
          { status: 409 },
        );
      }

      console.error("Voucher creation failed:", error);

      return Response.json(
        { error: "The voucher could not be created. No funds were reserved." },
        { status: 500 },
      );
    }
  }

  return Response.json(
    { error: "The voucher could not be created. Please try again." },
    { status: 500 },
  );
}
