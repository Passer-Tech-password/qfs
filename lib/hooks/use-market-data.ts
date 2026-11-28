"use client";

import { useEffect, useState } from "react";

export type AssetMarketData = {
  priceUsd: number;
  marketCapUsd: number;
  volume24hUsd: number;
  priceChange24hPct: number;
};

export type MarketData = {
  assets: {
    XLM: AssetMarketData;
    XRP: AssetMarketData;
  };
  velocity: { timestamp: number; percentPerHour: number }[];
  observedAt: number;
  source: string;
};

export type MarketDataStatus = "loading" | "live" | "delayed" | "unavailable";

export function useMarketData() {
  const [data, setData] = useState<MarketData | null>(null);
  const [status, setStatus] = useState<MarketDataStatus>("loading");

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    async function refresh() {
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch("/api/market-data", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as MarketData | { error?: string };

        if (!response.ok || !("assets" in result)) {
          throw new Error("Live market data is unavailable.");
        }

        if (active) {
          setData(result);
          setStatus("live");
        }
      } catch {
        if (!active || controller.signal.aborted) return;
        setStatus((current) =>
          current === "live" || current === "delayed" ? "delayed" : "unavailable",
        );
      }
    }

    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
      controller?.abort();
    };
  }, []);

  return { data, status };
}
