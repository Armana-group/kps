export interface PaymentSlot {
  timestamp: number;
  source: 'contract' | 'projected';
  eligible: boolean;
  reason?: 'not-started' | 'ended';
}

export function parseUtcDate(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null;
  return timestamp;
}

export const PROJECT_END_HOUR_UTC = 13;

/** The selected final day includes the usual 12:00 UTC payout, with a one-hour margin. */
export function getProjectDateTimestamps(startDate: string, endDate: string): { start: number; end: number } | null {
  const start = parseUtcDate(startDate);
  const finalDay = parseUtcDate(endDate);
  if (start === null || finalDay === null || finalDay <= start) return null;
  return { start, end: finalDay + PROJECT_END_HOUR_UTC * 60 * 60 * 1000 };
}

function monthEndPayment(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) - 12 * 60 * 60 * 1000;
}

/** Mainnet: start <= payment time < end. Start is 00:00 UTC; end is 13:00 UTC. */
export function buildPaymentSchedule(startDate: string, endDate: string, paymentTimes: string[]): PaymentSlot[] {
  const timestamps = getProjectDateTimestamps(startDate, endDate);
  if (!timestamps) return [];
  const { start, end } = timestamps;

  const times = paymentTimes.map(Number);
  if (!times.length || times.some((time, index) => !Number.isSafeInteger(time) || time <= 0 ||
      !Number.isFinite(new Date(time).getTime()) || (index > 0 && time <= times[index - 1]))) {
    throw new Error('Invalid payment schedule');
  }

  const slots: PaymentSlot[] = [];
  const addSlot = (timestamp: number, source: PaymentSlot['source']) => {
    // Include the start/end months' payment events, even when excluded, so cutoffs are visible.
    const month = new Date(timestamp).toISOString().slice(0, 7);
    if (month < startDate.slice(0, 7) || month > endDate.slice(0, 7)) return;
    const eligible = start <= timestamp && timestamp < end;
    slots.push({ timestamp, source, eligible, reason: eligible ? undefined : timestamp < start ? 'not-started' : 'ended' });
  };
  times.forEach(time => addSlot(time, 'contract'));

  // The contract registers six events. Extend the mainnet month-end rule beyond that window,
  // explicitly marking those dates as projections rather than registered payment times.
  if (times.every(time => time === monthEndPayment(time))) {
    let last = times[times.length - 1];
    while (true) {
      const date = new Date(last);
      const next = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 2, 1) - 12 * 60 * 60 * 1000;
      if (next > monthEndPayment(end)) break;
      addSlot(next, 'projected');
      last = next;
    }
  }
  return slots;
}

export function endDateAfterPayment(timestamp: number): string {
  const date = new Date(timestamp);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)).toISOString().slice(0, 10);
}

/** Match the submission page's rounding to the smallest KOIN unit. */
export function requestedPaymentUnits(value: string): bigint | null {
  const amount = Number(value);
  const units = Math.ceil(amount * 1e8);
  return amount > 0 && Number.isSafeInteger(units) ? BigInt(units) : null;
}

export function formatKoinUnits(units: bigint): string {
  const base = BigInt(100000000);
  const whole = (units / base).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = (units % base).toString().padStart(8, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}
