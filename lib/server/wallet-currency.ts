
export const WALLET_CURRENCIES = {
  USDT: { decimals: 6, label: "Tether USD" },
  BTC: { decimals: 8, label: "Bitcoin" },
  XLM: { decimals: 7, label: "Stellar Lumens" },
  XRP: { decimals: 6, label: "XRP" },
} as const;

export type WalletCurrency = keyof typeof WALLET_CURRENCIES;

export function isWalletCurrency(
  value: unknown,
): value is WalletCurrency {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(WALLET_CURRENCIES, value)
  );
}

export function parseWalletAmount(
  amount: unknown,
  currency: WalletCurrency,
): number | null {
  if (typeof amount !== "string" || amount.length > 40) {
    return null;
  }

  const value = amount.trim();
  const decimals = WALLET_CURRENCIES[currency].decimals;

  if (!/^\d+(\.\d+)?$/.test(value)) {
    return null;
  }

  const [whole, fraction = ""] = value.split(".");

  if (fraction.length > decimals) {
    return null;
  }

  try {
    const scale = BigInt(10) ** BigInt(decimals);
    const fractionalUnits = BigInt(
      (fraction + "0".repeat(decimals)).slice(0, decimals) || "0",
    );

    const units = BigInt(whole) * scale + fractionalUnits;

    if (units <= BigInt(0) || units > BigInt(Number.MAX_SAFE_INTEGER)) {
      return null;
    }

    return Number(units);
  } catch {
    return null;
  }
}

export function formatWalletAmount(
  units: number,
  currency: WalletCurrency,
): string {
  if (!Number.isSafeInteger(units) || units < 0) {
    return "0";
  }

  const decimals = WALLET_CURRENCIES[currency].decimals;
  const scale = 10 ** decimals;
  const whole = Math.floor(units / scale);
  const fraction = String(units % scale)
    .padStart(decimals, "0")
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : String(whole);
}

export function emptyWalletBalances(): Record<WalletCurrency, number> {
  return {
    USDT: 0,
    BTC: 0,
    XLM: 0,
    XRP: 0,
  };
}