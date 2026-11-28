import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/server/admin-api";
import {
  emptyWalletBalances,
  isWalletCurrency,
} from "@/lib/server/wallet-currency";
import { applyDelta, normalizeBalances } from "@/lib/server/wallet-ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Flows an administrator can settle from the Money Requests console. */
const SETTLEABLE_FLOWS = new Set([
  "deposits",
  "transfers",
  "swaps",
  "fixedDeposits",
  "payouts",
  "disputes",
  "escrows",
]);

/** Flows that reserve funds in the wallet `holds` map while pending. */
const WALLET_HOLD_FLOWS = new Set(["payouts", "transfers"]);

const SETTLE_STATUSES = new Set(["completed", "rejected", "processing"]);

function readString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const access = await requireAdmin(request);

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

  const uid = readString(body.uid, 128);
  const flow = readString(body.flow, 40);
  const id = readString(body.id, 200);
  const status = readString(body.status, 20);

  if (!uid || !id || !SETTLEABLE_FLOWS.has(flow) || !SETTLE_STATUSES.has(status)) {
    return Response.json(
      { error: "Invalid settlement request." },
      { status: 400 },
    );
  }

  const { adminUid, db } = access;

  const recordRef = db
    .collection("users")
    .doc(uid)
    .collection(flow)
    .doc(id);
  const walletRef = db.collection("wallets").doc(uid);
  const notificationRef = db.collection("userNotifications").doc();
  const auditRef = db.collection("adminAuditLogs").doc();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const [recordSnapshot, walletSnapshot] = await Promise.all([
        transaction.get(recordRef),
        transaction.get(walletRef),
      ]);

      if (!recordSnapshot.exists) {
        throw new Error("NOT_FOUND");
      }

      const record = recordSnapshot.data() ?? {};
      const currentStatus = String(record.status ?? "pending");

      // Settlement is a one-way transition out of a pending/processing state,
      // so a second approval can never release or refund the same funds twice.
      if (currentStatus === "completed" || currentStatus === "rejected") {
        return { alreadySettled: true, status: currentStatus };
      }

      const currency = record.currency ?? record.asset ?? record.symbol;
      const units = Number(record.amountUnits);
      const isHoldFlow = WALLET_HOLD_FLOWS.has(flow);
      const hasReservedUnits =
        isWalletCurrency(currency) &&
        Number.isSafeInteger(units) &&
        units > 0;
      const movesFunds = isHoldFlow && hasReservedUnits && status !== "processing";

      if (movesFunds && isWalletCurrency(currency)) {
        const walletData = walletSnapshot.data() ?? {};
        const holds = normalizeBalances(walletData.holds) ?? emptyWalletBalances();
        const balances = normalizeBalances(walletData.balances);

        if (!balances) {
          throw new Error("INVALID_WALLET_BALANCE");
        }

        if (holds[currency] < units) {
          throw new Error("HOLD_MISMATCH");
        }

        const holdsNext = { ...holds, [currency]: holds[currency] - units };
        let balancesNext = balances;

        // Rejection returns the reserved units to the spendable balance.
        if (status === "rejected") {
          const refunded = applyDelta(balances[currency], units);

          if (refunded === null) {
            throw new Error("BALANCE_LIMIT_EXCEEDED");
          }

          balancesNext = { ...balances, [currency]: refunded };
        }

        transaction.set(
          walletRef,
          {
            userId: uid,
            balances: balancesNext,
            holds: holdsNext,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        const transactionId =
          typeof record.transactionId === "string" ? record.transactionId : "";

        if (transactionId) {
          transaction.set(
            db.collection("walletTransactions").doc(transactionId),
            {
              status,
              settledAt: FieldValue.serverTimestamp(),
              settledBy: adminUid,
            },
            { merge: true },
          );
        }

        const approved = status === "completed";

        transaction.create(notificationRef, {
          userId: uid,
          type: approved ? "payout_approved" : "payout_rejected",
          title: approved ? "Request approved" : "Request rejected",
          message: approved
            ? `Your ${flow} request of ${units} ${currency} units was approved and settled.`
            : `Your ${flow} request was rejected. The reserved funds were returned to your balance.`,
          read: false,
          metadata: { flow, currency, amountUnits: units, status },
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      transaction.set(
        recordRef,
        {
          status,
          settledAt: FieldValue.serverTimestamp(),
          settledBy: adminUid,
        },
        { merge: true },
      );

      transaction.create(auditRef, {
        action: "request_settled",
        adminUid,
        targetUserId: uid,
        flow,
        recordId: id,
        status,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { alreadySettled: false, status };
    });

    return Response.json({
      success: true,
      status: result.status,
      message: result.alreadySettled
        ? "This request was already settled."
        : "Request settled successfully.",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "NOT_FOUND") {
      return Response.json({ error: "The request could not be found." }, { status: 404 });
    }

    if (code === "HOLD_MISMATCH") {
      return Response.json(
        { error: "The reserved funds for this request are inconsistent. Settlement was cancelled." },
        { status: 409 },
      );
    }

    if (code === "INVALID_WALLET_BALANCE" || code === "BALANCE_LIMIT_EXCEEDED") {
      return Response.json(
        { error: "The wallet contains invalid balance data. Settlement was cancelled." },
        { status: 409 },
      );
    }

    console.error("Request settlement failed:", error);

    return Response.json(
      { error: "The request could not be settled." },
      { status: 500 },
    );
  }
}
