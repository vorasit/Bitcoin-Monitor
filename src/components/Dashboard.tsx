"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Gauge from "@/components/Gauge";
import StatCard from "@/components/StatCard";
import PriceChart from "@/components/PriceChart";
import MonthlyReturns from "@/components/MonthlyReturns";
import HalvingCountdown from "@/components/HalvingCountdown";
import PriceAlerts from "@/components/PriceAlerts";
import { useLivePrice } from "@/lib/useLivePrice";
import type { HalvingInfo, MarketSummary, PriceHistory } from "@/lib/types";
import { formatCompactUSD, formatDateTimeUTC, formatPercent, formatUSD } from "@/lib/format";

const SUMMARY_POLL_MS = 60_000;
const HISTORY_POLL_MS = 10 * 60_000;
const HALVING_POLL_MS = 5 * 60_000;

function changeColor(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-zinc-300";
}

export default function Dashboard() {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [halving, setHalving] = useState<HalvingInfo | null>(null);
  const [error, setError] = useState(false);
  const { price: livePrice, connected: liveConnected } = useLivePrice();

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const res = await fetch("/api/summary", { cache: "no-store" });
        const data: MarketSummary = await res.json();
        if (!cancelled) {
          setSummary(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    async function loadHistory() {
      try {
        const res = await fetch("/api/history", { cache: "no-store" });
        const data: PriceHistory = await res.json();
        if (!cancelled) setHistory(data);
      } catch {
        // keep previous history on failure
      }
    }

    async function loadHalving() {
      try {
        const res = await fetch("/api/halving", { cache: "no-store" });
        if (!res.ok) return;
        const data: HalvingInfo = await res.json();
        if (!cancelled) setHalving(data);
      } catch {
        // keep previous halving data on failure
      }
    }

    loadSummary();
    loadHistory();
    loadHalving();
    const summaryInterval = setInterval(loadSummary, SUMMARY_POLL_MS);
    const historyInterval = setInterval(loadHistory, HISTORY_POLL_MS);
    const halvingInterval = setInterval(loadHalving, HALVING_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(summaryInterval);
      clearInterval(historyInterval);
      clearInterval(halvingInterval);
    };
  }, []);

  const displayPrice = livePrice ?? summary?.price ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        updatedAt={summary ? formatDateTimeUTC(summary.updatedAt) : null}
        isLive={liveConnected || (!error && !!summary)}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-300">
            เชื่อมต่อข้อมูลไม่สำเร็จ กำลังลองใหม่อัตโนมัติ...
          </div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                BTC / USD
                {liveConnected && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="mt-1 text-4xl font-bold text-zinc-50 sm:text-5xl">
                {summary || livePrice ? formatUSD(displayPrice) : "$0.00"}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className={changeColor(summary?.change24h ?? 0)}>
                  24 ชม. {summary ? formatPercent(summary.change24h) : "—"}
                </span>
                <span className={changeColor(summary?.change7d ?? 0)}>
                  7 วัน {summary ? formatPercent(summary.change7d) : "—"}
                </span>
                <span className={changeColor(summary?.change30d ?? 0)}>
                  30 วัน {summary ? formatPercent(summary.change30d) : "—"}
                </span>
              </div>
            </div>
            {summary?.fearGreed && (
              <Gauge
                value={summary.fearGreed.value}
                label={`ดัชนีกลัว/โลภ`}
                sublabel={summary.fearGreed.classification}
              />
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon="💰"
            label="Market Cap"
            value={summary ? formatCompactUSD(summary.marketCap) : "—"}
          />
          <StatCard
            icon="📊"
            label="ปริมาณ 24 ชม."
            value={summary ? formatCompactUSD(summary.volume24h) : "—"}
          />
          <StatCard
            icon="🏛️"
            label="BTC Dominance"
            value={summary?.dominance != null ? `${summary.dominance.toFixed(1)}%` : "—"}
          />
          <StatCard
            icon="🏔️"
            label="All-Time High"
            value={summary ? formatCompactUSD(summary.ath) : "—"}
            sublabel={summary ? `${formatPercent(summary.athChangePercentage)} จาก ATH` : undefined}
          />
          <StatCard
            icon="⚙️"
            label="Funding Rate"
            value={summary?.funding ? `${(summary.funding.rate * 100).toFixed(4)}%` : "—"}
            sublabel="Binance Futures / 8 ชม."
            valueClassName={summary?.funding ? changeColor(summary.funding.rate) : undefined}
          />
          <StatCard
            icon="📈"
            label="Open Interest"
            value={summary?.openInterest ? formatCompactUSD(summary.openInterest.usd) : "—"}
            sublabel={
              summary?.openInterest ? `${summary.openInterest.btc.toLocaleString()} BTC` : undefined
            }
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-200">⏳ นับถอยหลัง Bitcoin Halving</h2>
            <HalvingCountdown halving={halving} />
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-200">🔔 ตั้งแจ้งเตือนราคา</h2>
            <PriceAlerts price={livePrice ?? summary?.price ?? null} />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-200">
            📐 ราคา BTC — {history && history.prices.length > 0 ? "365 วันล่าสุด" : "กำลังโหลด"}
          </h2>
          <PriceChart prices={history?.prices ?? []} />
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-200">🗓️ ผลตอบแทนรายเดือน (%)</h2>
          <MonthlyReturns prices={history?.prices ?? []} />
        </section>

        <footer className="pb-6 text-center text-xs text-zinc-600">
          ข้อมูลจาก CoinGecko, Binance Futures และ Alternative.me Fear &amp; Greed Index (public API) —
          ไม่รวมตัวชี้วัด on-chain เช่น MVRV / SOPR / Realized Price ซึ่งต้องใช้ full node ของตนเอง
        </footer>
      </main>
    </div>
  );
}
