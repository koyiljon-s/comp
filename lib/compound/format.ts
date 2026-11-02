const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

export function formatUsd(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < 0.01 && value !== 0) return "<$0.01";

  return usdFormatter.format(value);
}

export function formatCompactUsd(value: number) {
  if (!Number.isFinite(value)) return "—";

  return compactUsdFormatter.format(value);
}

export function formatPercent(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";

  return `${(value * 100).toFixed(digits)}%`;
}

export function formatToken(value: number, digits = 4) {
  if (!Number.isFinite(value)) return "—";
  if (value !== 0 && Math.abs(value) < 0.0001) return "<0.0001";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatHealthFactor(value: number | null) {
  if (value === null) return "—";
  if (!Number.isFinite(value)) return "∞";
  if (value >= 100) return "99+";

  return value.toFixed(2);
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatRelativeTime(iso: string) {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "—";

  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));

  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.round(hours / 24)}d ago`;
}
