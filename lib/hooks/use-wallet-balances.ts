"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useMarketData } from "@/lib/hooks/use-market-data";
import {
  WALLET_CURRENCIES,
  formatWalletAmount,
  type WalletCurrency,
} from "@/lib/server/wallet-currency";

export const WALLET_CURRENCY_ORDER: WalletCurrency[] = [
  "USDT",
  "BTC",
  "XLM",
  "XRP",
];

export type WalletBalances = Record<WalletCurrency, number>;

export type WalletAsset = {
  currency: WalletCurrency;
  units: number;
  amount: string;
  priceUsd: number | null;
  usdValue: number | null;
  changePct: number | null;
};

const EMPTY_BALANCES: WalletBalances = { USDT: 0, BTC: 0, XLM: 0, XRP: 0 };

// Stablecoins are pegged to USD; other assets use the live market feed.
const PEGGED_USD: Partial<Record<WalletCurrency, number>> = { USDT: 1 };

function normalizeBalances(value: unknown): WalletBalances {
  const source = (value ?? {}) as Record<string, unknown>;
  const normalized = { ...EMPTY_BALANCES };

  for (const currency of WALLET_CURRENCY_ORDER) {
    const units = Number(source[currency]);
    normalized[currency] =
      Number.isSafeInteger(units) && units >= 0 ? units : 0;
  }

  return normalized;
}

/**
 * Reads the signed-in user's wallet document (wallets/{uid}) in real time.
 * Admin funding credits and other writes appear without a page reload.
 */
export function useWalletBalances() {
  const auth = useAuth();
  const { data: marketData } = useMarketData();
  const [balances, setBalances] = useState<WalletBalances>(EMPTY_BALANCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status === "loading") return;

    if (auth.status !== "signed-in") {
      setBalances(EMPTY_BALANCES);
      setLoading(false);
      return;
    }

    let db;
    try {
      db = getFirebaseClients().db;
    } catch {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "wallets", auth.user.uid),
      (snapshot) => {
        setBalances(normalizeBalances(snapshot.data()?.balances));
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsubscribe();
  }, [auth]);

  const assets = useMemo<WalletAsset[]>(() => {
    return WALLET_CURRENCY_ORDER.map((currency) => {
      const units = balances[currency];
      const marketAsset =
        currency === "XLM"
          ? marketData?.assets.XLM
          : currency === "XRP"
            ? marketData?.assets.XRP
            : currency === "BTC"
              ? marketData?.assets.BTC
              : undefined;

      const rawPrice = PEGGED_USD[currency] ?? marketAsset?.priceUsd;
      const priceUsd =
        typeof rawPrice === "number" && Number.isFinite(rawPrice)
          ? rawPrice
          : null;
      const changePct = PEGGED_USD[currency]
        ? 0
        : (marketAsset?.priceChange24hPct ?? null);

      const humanAmount = units / 10 ** WALLET_CURRENCIES[currency].decimals;

      return {
        currency,
        units,
        amount: formatWalletAmount(units, currency),
        priceUsd,
        usdValue: priceUsd !== null ? humanAmount * priceUsd : null,
        changePct:
          typeof changePct === "number" && Number.isFinite(changePct)
            ? changePct
            : null,
      };
    });
  }, [balances, marketData]);

  const totalUsd = useMemo(
    () => assets.reduce((sum, asset) => sum + (asset.usdValue ?? 0), 0),
    [assets],
  );

  // True when a held asset has no live price, so the total understates value.
  const hasUnpricedHolding = useMemo(
    () => assets.some((asset) => asset.units > 0 && asset.usdValue === null),
    [assets],
  );

  return { balances, assets, totalUsd, hasUnpricedHolding, loading };
}
