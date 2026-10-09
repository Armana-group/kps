// Display helpers. Kept free of runtime imports so tests can load them directly.

/** Whole KOIN with thousands separators; small amounts keep up to two decimals. */
export function formatKoin(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString('en-US');
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** "Oct 31, 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "Oct 2026" */
export function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** "in 22 days", "tomorrow", "today", or "passed". */
export function formatCountdown(date: Date, now: Date = new Date()): string {
  const days = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return 'passed';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/** "1Mdq…GFpZ" */
export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
