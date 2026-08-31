import { NextResponse } from "next/server";
import type { HalvingInfo } from "@/lib/types";

export const revalidate = 300;

const BLOCKS_PER_EPOCH = 210_000;
const INITIAL_REWARD = 50;
const DEFAULT_BLOCK_TIME_SEC = 600;

interface DifficultyAdjustment {
  timeAvg?: number; // ms
}

let cachedHeight: number | null = null;
let cachedTimeAvgMs: number | null = null;

export async function GET() {
  try {
    const res = await fetch("https://mempool.space/api/blocks/tip/height", {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const height = parseInt(await res.text(), 10);
      if (Number.isFinite(height)) cachedHeight = height;
    }
  } catch {
    // keep last known-good cachedHeight
  }

  try {
    const res = await fetch("https://mempool.space/api/v1/difficulty-adjustment", {
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data: DifficultyAdjustment = await res.json();
      if (data.timeAvg) cachedTimeAvgMs = data.timeAvg;
    }
  } catch {
    // keep last known-good cachedTimeAvgMs
  }

  if (cachedHeight === null) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const epoch = Math.floor(cachedHeight / BLOCKS_PER_EPOCH);
  const targetBlock = (epoch + 1) * BLOCKS_PER_EPOCH;
  const blocksRemaining = targetBlock - cachedHeight;
  const avgBlockTimeSec = cachedTimeAvgMs ? cachedTimeAvgMs / 1000 : DEFAULT_BLOCK_TIME_SEC;
  const estimatedDate = new Date(Date.now() + blocksRemaining * avgBlockTimeSec * 1000).toISOString();
  const currentReward = INITIAL_REWARD / Math.pow(2, epoch);

  const halving: HalvingInfo = {
    currentBlock: cachedHeight,
    targetBlock,
    blocksRemaining,
    estimatedDate,
    avgBlockTimeSec,
    currentReward,
    nextReward: currentReward / 2,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(halving);
}
