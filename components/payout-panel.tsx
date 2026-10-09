"use client";

import { formatCountdown, formatDate, formatKoin } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PayoutProject {
  id: number;
  title: string;
  monthly_payment: string;
  calculatedPayment?: number;
  paymentStatus?: 'full' | 'partial' | 'none';
}

interface PayoutPanelProps {
  fundBalance: number | null;
  nextPaymentTime: Date | null;
  activeProjects: PayoutProject[];
  upcomingCount: number;
  loading: boolean;
}

// Segment fills after the first: ink at falling opacity, so one accent stays one accent.
const inkOpacity = [0.82, 0.6, 0.45, 0.34, 0.26];

/** The hero's right side: how the next monthly payment splits across projects, as of now. */
export function PayoutPanel({ fundBalance, nextPaymentTime, activeProjects, upcomingCount, loading }: PayoutPanelProps) {
  const balance = fundBalance ?? 0;
  const paid = activeProjects.filter((p) => (p.calculatedPayment ?? 0) > 0);
  const unpaid = activeProjects.length - paid.length;
  const allocated = paid.reduce((sum, p) => sum + (p.calculatedPayment ?? 0), 0);
  const leftover = Math.max(0, balance - allocated);
  const pct = (n: number) => (balance > 0 ? (n / balance) * 100 : 0);
  const shown = paid.slice(0, 3);
  const moreCount = paid.length - shown.length;

  const segmentStyle = (i: number) =>
    i === 0 ? { background: 'var(--accent)' } : { background: 'var(--ink)', opacity: inkOpacity[Math.min(i - 1, inkOpacity.length - 1)] };

  return (
    <section className="rounded-[22px] bg-panel p-6 lg:rounded-[28px] lg:p-8" aria-label="Next payout">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Next payout</h2>
        <span className="text-sm text-ink-2">
          {nextPaymentTime ? `${formatDate(nextPaymentTime)} · ${formatCountdown(nextPaymentTime)}` : loading ? 'Loading' : 'Not scheduled'}
        </span>
      </div>

      <div className="mt-7 text-[36px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
        {fundBalance === null ? <span className="inline-block h-9 w-40 animate-pulse rounded bg-panel-strong align-middle" /> : formatKoin(balance)}
        <small className="ml-1.5 text-[18px] font-medium tracking-[-0.01em] text-ink-2">KOIN in the fund</small>
      </div>
      <p className="mt-2 text-sm text-ink-2">Paid to active projects in order of votes until the balance runs out.</p>

      <div className="mt-7 flex h-11 gap-[3px] overflow-hidden rounded-xl" role="img" aria-label={
        paid.length ? `Payout split: ${paid.map((p) => `${p.title} ${formatKoin(p.calculatedPayment ?? 0)} KOIN`).join(', ')}` : 'No payout allocated yet'
      }>
        {loading && paid.length === 0 ? (
          <div className="h-full w-full animate-pulse bg-panel-strong" />
        ) : (
          <>
            {paid.map((p, i) => (
              <div key={p.id} className="h-full" style={{ width: `${pct(p.calculatedPayment ?? 0)}%`, ...segmentStyle(i) }} />
            ))}
            {leftover > 0 && <div className="h-full flex-1 bg-panel-strong" />}
          </>
        )}
      </div>

      <ul className="mt-5 grid gap-2.5 text-sm">
        {shown.map((p, i) => {
          const monthly = parseFloat(p.monthly_payment);
          const share = monthly > 0 ? ((p.calculatedPayment ?? 0) / monthly) * 100 : 0;
          return (
            <li key={p.id} className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3">
              <span className="size-2.5 rounded-[3px]" style={segmentStyle(i)} aria-hidden="true" />
              <span className="truncate font-medium">
                {p.title}{' '}
                <small className="font-normal text-ink-2">
                  · {p.paymentStatus === 'full' ? 'paid in full' : `partial, ${share < 1 ? share.toFixed(1) : Math.round(share)}% of its ask`}
                </small>
              </span>
              <span className="font-semibold tabular-nums">{formatKoin(p.calculatedPayment ?? 0)}</span>
            </li>
          );
        })}
        {moreCount > 0 && (
          <li className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3 text-ink-2">
            <span className="size-2.5 rounded-[3px] bg-ink/30" aria-hidden="true" />
            <span className="truncate">{moreCount} more paid project{moreCount === 1 ? '' : 's'}</span>
            <span className="tabular-nums">{formatKoin(paid.slice(3).reduce((s, p) => s + (p.calculatedPayment ?? 0), 0))}</span>
          </li>
        )}
        {unpaid > 0 && (
          <li className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3 text-ink-2">
            <span className="size-2.5 rounded-[3px] bg-panel-strong" aria-hidden="true" />
            <span className="truncate">
              {unpaid} more active project{unpaid === 1 ? '' : 's'} <small>· nothing left for this month</small>
            </span>
            <span className="tabular-nums">0</span>
          </li>
        )}
        {leftover > 0 && paid.length > 0 && (
          <li className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3 text-ink-2">
            <span className="size-2.5 rounded-[3px] bg-panel-strong" aria-hidden="true" />
            <span className="truncate">Stays in the fund</span>
            <span className="tabular-nums">{formatKoin(leftover)}</span>
          </li>
        )}
        {!loading && paid.length === 0 && (
          <li className={cn('text-ink-2')}>No active project has votes yet, so nothing is paid out this month.</li>
        )}
      </ul>

      <div className="mt-6 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-line-strong pt-4 text-sm text-ink-2">
        <span>{activeProjects.length} active · {upcomingCount} starting soon</span>
        <span>Payouts on the last day of each month</span>
      </div>
    </section>
  );
}
