"use client";

import { useMemo } from "react";

interface MonthlyReturnsProps {
  prices: [number, number][];
}

const MONTH_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function colorFor(pct: number): string {
  if (pct > 15) return "bg-emerald-600/90 text-emerald-50";
  if (pct > 5) return "bg-emerald-700/60 text-emerald-100";
  if (pct > 0) return "bg-emerald-800/40 text-emerald-200";
  if (pct === 0) return "bg-zinc-800 text-zinc-400";
  if (pct > -5) return "bg-red-900/40 text-red-200";
  if (pct > -15) return "bg-red-800/60 text-red-100";
  return "bg-red-700/90 text-red-50";
}

export default function MonthlyReturns({ prices }: MonthlyReturnsProps) {
  const table = useMemo(() => {
    if (prices.length === 0) return { years: [], grid: {} as Record<number, Record<number, number>> };

    const byMonth = new Map<string, { first: number; last: number }>();
    for (const [t, p] of prices) {
      const d = new Date(t);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      const existing = byMonth.get(key);
      if (!existing) {
        byMonth.set(key, { first: p, last: p });
      } else {
        existing.last = p;
      }
    }

    const grid: Record<number, Record<number, number>> = {};
    const years = new Set<number>();
    for (const [key, { first, last }] of byMonth) {
      const [yearStr, monthStr] = key.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const pct = ((last - first) / first) * 100;
      grid[year] = grid[year] ?? {};
      grid[year][month] = pct;
      years.add(year);
    }

    return { years: Array.from(years).sort((a, b) => a - b), grid };
  }, [prices]);

  if (table.years.length === 0) {
    return <div className="text-sm text-zinc-500">ไม่มีข้อมูลเพียงพอสำหรับคำนวณผลตอบแทนรายเดือน</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate border-spacing-1 text-center text-xs">
        <thead>
          <tr>
            <th className="w-10 text-zinc-500" />
            {MONTH_LABELS.map((m) => (
              <th key={m} className="w-12 py-1 font-medium text-zinc-500">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.years.map((year) => (
            <tr key={year}>
              <td className="pr-2 text-right font-medium text-zinc-500">{String(year).slice(2)}</td>
              {MONTH_LABELS.map((_, idx) => {
                const pct = table.grid[year]?.[idx];
                if (pct === undefined) {
                  return <td key={idx} className="rounded-md bg-zinc-900/40 py-2" />;
                }
                return (
                  <td key={idx} className={`rounded-md py-2 font-medium ${colorFor(pct)}`}>
                    {pct > 0 ? "+" : ""}
                    {pct.toFixed(0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-zinc-600">
        คำนวณจากข้อมูลราคาย้อนหลัง 365 วันล่าสุด (public API) จึงครอบคลุมไม่ถึง 2 ปีปฏิทิน
      </p>
    </div>
  );
}
