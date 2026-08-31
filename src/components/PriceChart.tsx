"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactUSD } from "@/lib/format";
import { rsi, sma } from "@/lib/indicators";

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
  const [showMA, setShowMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  const full = useMemo(() => {
    const closes = prices.map(([, p]) => p);
    return {
      ma50: sma(closes, 50),
      ma200: sma(closes, 200),
      rsi14: rsi(closes, 14),
    };
  }, [prices]);

  const data = useMemo(() => {
    const sliceFrom = rangeDays >= prices.length ? 0 : prices.length - rangeDays;
    return prices.slice(sliceFrom).map(([t, p], idx) => {
      const i = sliceFrom + idx;
      return {
        date: new Date(t).toISOString().slice(0, 10),
        price: p,
        ma50: full.ma50[i],
        ma200: full.ma200[i],
        rsi: full.rsi14[i],
      };
    });
  }, [prices, rangeDays, full]);

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
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setShowMA((v) => !v)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              showMA ? "bg-sky-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            MA 50/200
          </button>
          <button
            onClick={() => setShowRSI((v) => !v)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              showRSI ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            RSI 14
          </button>
          <button
            onClick={() => setLogScale((v) => !v)}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
          >
            สเกล: {logScale ? "Log" : "Linear"}
          </button>
        </div>
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
            formatter={(value, name) => [
              formatCompactUSD(Number(value)),
              name === "price" ? "ราคา" : name === "ma50" ? "MA 50" : "MA 200",
            ]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#priceFill)"
          />
          {showMA && (
            <Line
              type="monotone"
              dataKey="ma50"
              stroke="#38bdf8"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
          {showMA && (
            <Line
              type="monotone"
              dataKey="ma200"
              stroke="#a78bfa"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {showRSI && (
        <div className="mt-2">
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis
                domain={[0, 100]}
                ticks={[30, 50, 70]}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={64}
              />
              <ReferenceLine y={70} stroke="#71717a" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#71717a" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(value) => [Number(value).toFixed(1), "RSI"]}
              />
              <Line type="monotone" dataKey="rsi" stroke="#a78bfa" strokeWidth={1.5} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="mt-2 text-xs text-zinc-600">
        ข้อมูลราคาย้อนหลังจาก CoinGecko (public API) จำกัดที่ 365 วันล่าสุด
      </p>
    </div>
  );
}
