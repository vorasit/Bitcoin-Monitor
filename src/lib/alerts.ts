import type { PriceAlert } from "@/lib/types";

const STORAGE_KEY = "btc-monitor-alerts";

type Listener = () => void;

const alertListeners = new Set<Listener>();
const permissionListeners = new Set<Listener>();
const EMPTY_ALERTS: PriceAlert[] = [];
let cachedAlerts: PriceAlert[] = EMPTY_ALERTS;
let hydrated = false;

function readAlertsFromStorage(): PriceAlert[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(next: PriceAlert[]): void {
  cachedAlerts = next;
  hydrated = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy-mode errors
  }
  alertListeners.forEach((l) => l());
}

export function subscribeAlerts(listener: Listener): () => void {
  alertListeners.add(listener);
  return () => alertListeners.delete(listener);
}

export function getAlertsSnapshot(): PriceAlert[] {
  if (!hydrated) {
    cachedAlerts = readAlertsFromStorage();
    hydrated = true;
  }
  return cachedAlerts;
}

export function getServerAlertsSnapshot(): PriceAlert[] {
  return EMPTY_ALERTS;
}

export function addAlert(direction: "above" | "below", targetPrice: number): void {
  const alert: PriceAlert = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    direction,
    targetPrice,
    createdAt: new Date().toISOString(),
    triggeredAt: null,
  };
  persist([...getAlertsSnapshot(), alert]);
}

export function removeAlert(id: string): void {
  persist(getAlertsSnapshot().filter((a) => a.id !== id));
}

export function checkAlerts(price: number): void {
  const current = getAlertsSnapshot();
  if (current.length === 0) return;

  let changed = false;
  const next = current.map((alert) => {
    if (alert.triggeredAt) return alert;
    const hit =
      (alert.direction === "above" && price >= alert.targetPrice) ||
      (alert.direction === "below" && price <= alert.targetPrice);
    if (!hit) return alert;
    changed = true;
    notifyAlertTriggered(alert, price);
    return { ...alert, triggeredAt: new Date().toISOString() };
  });

  if (changed) persist(next);
}

function notifyAlertTriggered(alert: PriceAlert, price: number): void {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const dir = alert.direction === "above" ? "สูงกว่า" : "ต่ำกว่า";
  new Notification("BTC Monitor — แจ้งเตือนราคา", {
    body: `BTC/USD ${dir} $${alert.targetPrice.toLocaleString("en-US")} แล้ว (ราคาปัจจุบัน $${price.toLocaleString("en-US")})`,
    tag: alert.id,
  });
}

export function subscribePermission(listener: Listener): () => void {
  permissionListeners.add(listener);
  return () => permissionListeners.delete(listener);
}

export function getPermissionSnapshot(): NotificationPermission | "unsupported" {
  return typeof Notification !== "undefined" ? Notification.permission : "unsupported";
}

export function getServerPermissionSnapshot(): NotificationPermission | "unsupported" {
  return "unsupported";
}

export async function requestNotificationPermission(): Promise<void> {
  if (typeof Notification === "undefined") return;
  await Notification.requestPermission();
  permissionListeners.forEach((l) => l());
}
