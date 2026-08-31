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

export interface HalvingInfo {
  currentBlock: number;
  targetBlock: number;
  blocksRemaining: number;
  estimatedDate: string;
  avgBlockTimeSec: number;
  currentReward: number;
  nextReward: number;
  updatedAt: string;
}

export interface PriceAlert {
  id: string;
  direction: "above" | "below";
  targetPrice: number;
  createdAt: string;
  triggeredAt: string | null;
}
