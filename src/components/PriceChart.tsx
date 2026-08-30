"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactUSD } from "@/lib/format";

interface PriceChartProps {
  prices: [number, number][];
}

const RANGES = [
  { label: "7 วัน", days: 7 },
  { label: "30 วัน", days: 30 },
  { label: "90 วัน", days: 90 },
  { label: "1 ปี", days: 365 },
];

export default function PriceChart({ prices }: PriceChartProps) {
  const [rangeDays, setRangeDays] = useState(365);
  const [logScale, setLogScale] = useState(true);

  const data = useMemo(() => {
    const sliced = rangeDays >= prices.length ? prices : prices.slice(-rangeDays);
    return sliced.map(([t, p]) => ({
      date: new Date(t).toISOString().slice(0, 10),
      price: p,
    }));
  }, [prices, rangeDays]);

  if (prices.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
        ไม่สามารถโหลดข้อมูลราคาย้อนหลังได้ในขณะนี้
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRangeDays(r.days)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                rangeDays === r.days
                  ? "bg-orange-500 text-zinc-950"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setLogScale((v) => !v)}
          className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
        >
          สเกล: {logScale ? "Log" : "Linear"}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#3f3f46" }}
            minTickGap={40}
          />
          <YAxis
            scale={logScale ? "log" : "linear"}
            domain={logScale ? ["auto", "auto"] : [0, "auto"]}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompactUSD(v, 0)}
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => [formatCompactUSD(Number(value)), "ราคา"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#priceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-zinc-600">
        ข้อมูลราคาย้อนหลังจาก CoinGecko (public API) จำกัดที่ 365 วันล่าสุด
      </p>
    </div>
  );
}
