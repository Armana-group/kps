"use client";

import { formatCountdown, formatDate, formatKoin, formatShare, formatShortDate } from '@/lib/format';
import type { PaymentStatus, PayoutBudget } from '@/lib/payouts';

interface PayoutProject {
  id: number;
  title: string;
  monthly_payment: string;
  total_votes: string;
  calculatedPayment: number;
  paymentStatus: PaymentStatus;
}

interface PayoutPanelProps {
  budget: PayoutBudget | null;
  nextPaymentTime: Date | null;
  /** Every project in the next payout, from distributePayments. */
  payouts: PayoutProject[];
  activeCount: number;
  upcomingCount: number;
  loading: boolean;
}

// Segment fills after the first: ink at falling opacity, so one accent stays one accent.
const inkOpacity = [0.82, 0.6, 0.45, 0.34, 0.26];

/** The hero's right side: the next payout's budget and how it splits across projects. */
export function PayoutPanel({ budget, nextPaymentTime, payouts, activeCount, upcomingCount, loading }: PayoutPanelProps) {
  const total = budget?.budget ?? 0;
  const paid = payouts.filter((p) => p.paymentStatus === 'full' || p.paymentStatus === 'partial');
  const paidTotal = paid.reduce((sum, p) => sum + p.calculatedPayment, 0);
  // Budget set aside for projects paid to the fund itself, plus budget nobody claimed
  const staysInFund = Math.max(0, total - paidTotal);
  const unpaid = payouts.filter((p) => p.paymentStatus === 'none' && parseFloat(p.total_votes) > 0).length;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const shown = paid.slice(0, 3);
  const moreCount = paid.length - shown.length;
  const payoutDay = nextPaymentTime ? formatShortDate(nextPaymentTime) : 'the payout';

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
        {budget === null ? <span className="inline-block h-9 w-40 animate-pulse rounded bg-panel-strong align-middle" /> : <>~{formatKoin(total)}</>}
        <small className="ml-1.5 text-[18px] font-medium tracking-[-0.01em] text-ink-2">KOIN to pay out</small>
      </div>
      <p className="mt-2 text-sm text-ink-2">
        Each payout can spend twice the KOIN that came into the fund since the last one.
        {budget && <> {formatKoin(budget.receivedSoFar)} KOIN so far, about {formatKoin(budget.expectedReceived)} by {payoutDay} at this rate.</>}
      </p>

      <div className="mt-7 flex h-11 gap-[3px] overflow-hidden rounded-xl" role="img" aria-label={
        paid.length ? `Payout split: ${paid.map((p) => `${p.title} ${formatKoin(p.calculatedPayment)} KOIN`).join(', ')}` : 'No payout allocated yet'
      }>
        {loading && paid.length === 0 ? (
          <div className="h-full w-full animate-pulse bg-panel-strong" />
        ) : (
          <>
            {paid.map((p, i) => (
              <div key={p.id} className="h-full" style={{ width: `${pct(p.calculatedPayment)}%`, ...segmentStyle(i) }} />
            ))}
            {staysInFund > 0 && <div className="h-full flex-1 bg-panel-strong" />}
          </>
        )}
      </div>

      <ul className="mt-5 grid gap-2.5 text-sm">
        {shown.map((p, i) => (
          <li key={p.id} className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3">
            <span className="size-2.5 rounded-[3px]" style={segmentStyle(i)} aria-hidden="true" />
            <span className="truncate font-medium">
              {p.title}{' '}
              <small className="font-normal text-ink-2">
                · {p.paymentStatus === 'full' ? 'paid in full' : `partial, ${formatShare(p.calculatedPayment, parseFloat(p.monthly_payment))}% of its ask`}
              </small>
            </span>
            <span className="font-semibold tabular-nums">{formatKoin(p.calculatedPayment)}</span>
          </li>
        ))}
        {moreCount > 0 && (
          <li className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3 text-ink-2">
            <span className="size-2.5 rounded-[3px] bg-ink/30" aria-hidden="true" />
            <span className="truncate">{moreCount} more paid project{moreCount === 1 ? '' : 's'}</span>
            <span className="tabular-nums">{formatKoin(paid.slice(3).reduce((s, p) => s + p.calculatedPayment, 0))}</span>
          </li>
        )}
        {staysInFund > 0 && (
          <li className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3 text-ink-2">
            <span className="size-2.5 rounded-[3px] bg-panel-strong" aria-hidden="true" />
            <span className="truncate">Stays in the fund</span>
            <span className="tabular-nums">{formatKoin(staysInFund)}</span>
          </li>
        )}
        {unpaid > 0 && (
          <li className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3 text-ink-2">
            <span className="size-2.5 rounded-[3px] bg-panel-strong" aria-hidden="true" />
            <span className="truncate">
              {unpaid} more project{unpaid === 1 ? '' : 's'} with votes <small>· budget runs out first</small>
            </span>
            <span className="tabular-nums">0</span>
          </li>
        )}
        {!loading && paid.length === 0 && (
          <li className="text-ink-2">No project with votes is set to receive KOIN at this payout.</li>
        )}
      </ul>

      <div className="mt-6 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-line-strong pt-4 text-sm text-ink-2">
        <span>{activeCount} active · {upcomingCount} starting soon</span>
        <span>Payouts at noon UTC on the last day of each month</span>
      </div>
    </section>
  );
}
