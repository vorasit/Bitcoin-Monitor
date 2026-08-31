"use client";

import { useEffect, useState } from "react";

const WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

interface TradeMessage {
  p: string; // price
}

export function useLivePrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;
    let reconnectDelay = RECONNECT_BASE_MS;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (cancelled) return;
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        if (cancelled) return;
        setConnected(true);
        reconnectDelay = RECONNECT_BASE_MS;
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data: TradeMessage = JSON.parse(event.data);
          const p = parseFloat(data.p);
          if (Number.isFinite(p)) setPrice(p);
        } catch {
          // ignore malformed frame
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  return { price, connected };
}
