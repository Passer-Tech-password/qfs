import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CoinMarket = {
  id?: unknown;
  current_price?: unknown;
  market_cap?: unknown;
  total_volume?: unknown;
  price_change_percentage_24h?: unknown;
};

type MarketChart = {
  prices?: unknown;
};

function positiveNumber(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function parsePriceHistory(value: unknown): { timestamp: number; price: number }[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (point): point is [number, number] =>
        Array.isArray(point) &&
        point.length >= 2 &&
        Number.isFinite(Number(point[0])) &&
        positiveNumber(point[1]) !== null,
    )
    .map(([timestamp, price]) => ({
      timestamp: Number(timestamp),
      price: Number(price),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: HeadersInit = apiKey
    ? { "x-cg-demo-api-key": apiKey }
    : {};
  const signal = AbortSignal.timeout(10_000);

  try {
    const [marketsResult, historyResult] = await Promise.allSettled([
      fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=stellar%2Cripple%2Cbitcoin&price_change_percentage=24h",
        { headers, signal, cache: "no-store" },
      ),
      fetch(
        "https://api.coingecko.com/api/v3/coins/stellar/market_chart?vs_currency=usd&days=1",
        { headers, signal, cache: "no-store" },
      ),
    ]);

    const marketsResponse =
      marketsResult.status === "fulfilled" ? marketsResult.value : null;
    const historyResponse =
      historyResult.status === "fulfilled" ? historyResult.value : null;

    if (!marketsResponse?.ok) {
      throw new Error("Market data provider returned an error.");
    }

    const markets = (await marketsResponse.json()) as CoinMarket[];

    if (!Array.isArray(markets)) {
      throw new Error("Market data response was invalid.");
    }

    const byId = new Map(markets.map((coin) => [coin.id, coin]));

    function parseAsset(id: string) {
      const coin = byId.get(id);
      const priceUsd = positiveNumber(coin?.current_price);
      const marketCapUsd = positiveNumber(coin?.market_cap);
      const volume24hUsd = positiveNumber(coin?.total_volume);
      const priceChange24hPct = Number(coin?.price_change_percentage_24h);

      if (
        !priceUsd ||
        !marketCapUsd ||
        !volume24hUsd ||
        !Number.isFinite(priceChange24hPct)
      ) {
        throw new Error(`Market data for ${id} was incomplete.`);
      }

      return { priceUsd, marketCapUsd, volume24hUsd, priceChange24hPct };
    }

    let velocity: { timestamp: number; percentPerHour: number }[] = [];
    if (historyResponse?.ok) {
      try {
        const historyData = (await historyResponse.json()) as MarketChart;
        const history = parsePriceHistory(historyData.prices);

        velocity = history.slice(1).flatMap((point, index) => {
          const previous = history[index];
          const elapsedHours = (point.timestamp - previous.timestamp) / 3_600_000;
          const percentPerHour =
            ((point.price - previous.price) / previous.price / elapsedHours) * 100;

          return Number.isFinite(percentPerHour) && elapsedHours > 0
            ? [{ timestamp: point.timestamp, percentPerHour }]
            : [];
        });
      } catch (error) {
        console.warn("XLM market velocity history unavailable:", error);
      }
    }

    return NextResponse.json(
      {
        assets: {
          XLM: parseAsset("stellar"),
          XRP: parseAsset("ripple"),
        },
        velocity,
        observedAt: Date.now(),
        source: "CoinGecko",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Market data request failed:", error);
    return NextResponse.json(
      { error: "Live market data is temporarily unavailable." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
