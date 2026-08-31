"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  addAlert,
  checkAlerts,
  getAlertsSnapshot,
  getPermissionSnapshot,
  getServerAlertsSnapshot,
  getServerPermissionSnapshot,
  removeAlert,
  requestNotificationPermission,
  subscribeAlerts,
  subscribePermission,
} from "@/lib/alerts";
import { formatUSD } from "@/lib/format";

interface PriceAlertsProps {
  price: number | null;
}

export default function PriceAlerts({ price }: PriceAlertsProps) {
  const alerts = useSyncExternalStore(subscribeAlerts, getAlertsSnapshot, getServerAlertsSnapshot);
  const permission = useSyncExternalStore(subscribePermission, getPermissionSnapshot, getServerPermissionSnapshot);
  const [targetInput, setTargetInput] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");

  useEffect(() => {
    if (price != null) checkAlerts(price);
  }, [price]);

  function handleAdd() {
    const target = parseFloat(targetInput);
    if (!Number.isFinite(target) || target <= 0) return;
    addAlert(direction, target);
    setTargetInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-zinc-700">
          <button
            onClick={() => setDirection("above")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              direction === "above" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            สูงกว่า
          </button>
          <button
            onClick={() => setDirection("below")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              direction === "below" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            ต่ำกว่า
          </button>
        </div>
        <input
          type="number"
          inputMode="decimal"
          placeholder="ราคาเป้าหมาย (USD)"
          value={targetInput}
          onChange={(e) => setTargetInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-40 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-orange-400"
        >
          + ตั้งแจ้งเตือน
        </button>
        {permission !== "granted" && permission !== "unsupported" && (
          <button
            onClick={() => requestNotificationPermission()}
            className="text-xs text-zinc-500 underline decoration-dotted hover:text-zinc-300"
          >
            เปิดการแจ้งเตือนของเบราว์เซอร์
          </button>
        )}
      </div>

      {alerts.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                alert.triggeredAt
                  ? "border-zinc-800 bg-zinc-900/30 text-zinc-500"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-200"
              }`}
            >
              <span>
                {alert.direction === "above" ? "▲ สูงกว่า" : "▼ ต่ำกว่า"} {formatUSD(alert.targetPrice)}
                {alert.triggeredAt && <span className="ml-2 text-xs text-amber-500">แจ้งเตือนแล้ว</span>}
              </span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-zinc-500 hover:text-red-400"
                aria-label="ลบการแจ้งเตือน"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-zinc-600">ยังไม่มีการตั้งแจ้งเตือน</p>
      )}
    </div>
  );
}
