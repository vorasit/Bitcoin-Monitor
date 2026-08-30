import { NextResponse } from "next/server";
import type { PriceHistory } from "@/lib/types";

export const revalidate = 1800;

let cachedPrices: [number, number][] = [];

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365",
      { headers: { accept: "application/json" }, next: { revalidate: 1800 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.prices) && data.prices.length > 0) {
        cachedPrices = data.prices;
      }
    }
  } catch {
    // keep last known-good cachedPrices
  }

  const history: PriceHistory = {
    prices: cachedPrices,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(history);
}
