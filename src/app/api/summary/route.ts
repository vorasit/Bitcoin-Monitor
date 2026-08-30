import { NextResponse } from "next/server";
import type { MarketSummary } from "@/lib/types";

export const revalidate = 45;

interface CoinResponse {
  market_data?: {
    current_price?: { usd?: number };
    price_change_percentage_24h?: number;
    price_change_percentage_7d?: number;
    price_change_percentage_30d?: number;
    ath?: { usd?: number };
    ath_change_percentage?: { usd?: number };
    ath_date?: { usd?: string };
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
  };
}
interface GlobalResponse {
  data?: { market_cap_percentage?: { btc?: number } };
}
interface FngResponse {
  data?: { value: string; value_classification: string }[];
}
interface FundingResponse {
  lastFundingRate: string;
  markPrice: string;
  nextFundingTime: number;
}
interface OpenInterestResponse {
  openInterest: string;
}

const cache: {
  coin: CoinResponse | null;
  global: GlobalResponse | null;
  fng: FngResponse | null;
  funding: FundingResponse | null;
  openInterest: OpenInterestResponse | null;
} = { coin: null, global: null, fng: null, funding: null, openInterest: null };

async function fetchWithFallback<K extends keyof typeof cache>(
  url: string,
  key: K
): Promise<(typeof cache)[K]> {
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 45 },
    });
    if (!res.ok) return cache[key];
    const data = await res.json();
    cache[key] = data;
    return data;
  } catch {
    return cache[key];
  }
}

export async function GET() {
  const [coin, global, fng, funding, openInterest] = await Promise.all([
    fetchWithFallback(
      "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false",
      "coin"
    ),
    fetchWithFallback("https://api.coingecko.com/api/v3/global", "global"),
    fetchWithFallback("https://api.alternative.me/fng/?limit=1&format=json", "fng"),
    fetchWithFallback("https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT", "funding"),
    fetchWithFallback("https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT", "openInterest"),
  ]);

  const md = coin?.market_data;
  const price: number = md?.current_price?.usd ?? 0;
  const oiBtc: number = openInterest ? parseFloat(openInterest.openInterest) : 0;

  const summary: MarketSummary = {
    price,
    change24h: md?.price_change_percentage_24h ?? 0,
    change7d: md?.price_change_percentage_7d ?? 0,
    change30d: md?.price_change_percentage_30d ?? 0,
    ath: md?.ath?.usd ?? 0,
    athChangePercentage: md?.ath_change_percentage?.usd ?? 0,
    athDate: md?.ath_date?.usd ?? "",
    marketCap: md?.market_cap?.usd ?? 0,
    volume24h: md?.total_volume?.usd ?? 0,
    dominance: global?.data?.market_cap_percentage?.btc ?? null,
    fearGreed: fng?.data?.[0]
      ? {
          value: parseInt(fng.data[0].value, 10),
          classification: fng.data[0].value_classification,
        }
      : null,
    funding: funding
      ? {
          rate: parseFloat(funding.lastFundingRate),
          markPrice: parseFloat(funding.markPrice),
          nextFundingTime: funding.nextFundingTime,
        }
      : null,
    openInterest: openInterest
      ? {
          btc: oiBtc,
          usd: oiBtc * price,
        }
      : null,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(summary);
}
