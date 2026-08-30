export interface MarketSummary {
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  marketCap: number;
  volume24h: number;
  dominance: number | null;
  fearGreed: {
    value: number;
    classification: string;
  } | null;
  funding: {
    rate: number;
    markPrice: number;
    nextFundingTime: number;
  } | null;
  openInterest: {
    btc: number;
    usd: number;
  } | null;
  updatedAt: string;
}

export interface PriceHistory {
  prices: [number, number][];
  updatedAt: string;
}
