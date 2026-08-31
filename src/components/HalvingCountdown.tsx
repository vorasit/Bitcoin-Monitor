"use client";

import { useEffect, useState } from "react";
import type { HalvingInfo } from "@/lib/types";

interface HalvingCountdownProps {
  halving: HalvingInfo | null;
}

function splitDuration(ms: number) {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / 86_400_000);
  const hours = Math.floor((clamped % 86_400_000) / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums text-zinc-50 sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</span>
    </div>
  );
}

export default function HalvingCountdown({ halving }: HalvingCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!halving) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-zinc-500">
        กำลังโหลดข้อมูล Halving...
      </div>
    );
  }

  const remainingMs = new Date(halving.estimatedDate).getTime() - now;
  const { days, hours, minutes, seconds } = splitDuration(remainingMs);
  const progress = Math.min(
    100,
    Math.max(0, (1 - halving.blocksRemaining / 210_000) * 100)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
        <Unit value={days} label="วัน" />
        <Unit value={hours} label="ชม." />
        <Unit value={minutes} label="นาที" />
        <Unit value={seconds} label="วินาที" />
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-orange-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>
          บล็อก {halving.currentBlock.toLocaleString()} / {halving.targetBlock.toLocaleString()} (
          เหลืออีก {halving.blocksRemaining.toLocaleString()} บล็อก)
        </span>
        <span>
          รางวัล {halving.currentReward} → {halving.nextReward} BTC
        </span>
      </div>
    </div>
  );
}
