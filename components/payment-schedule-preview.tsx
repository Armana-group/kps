"use client";

import { useEffect, useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFundContract } from '@/lib/utils';
import { buildPaymentSchedule, endDateAfterPayment, formatKoinUnits, getProjectDateTimestamps, requestedPaymentUnits } from '@/lib/payment-schedule';

interface PaymentSchedulePreviewProps {
  startDate: string;
  endDate: string;
  monthlyPayment: string;
  onEndDateChange: (value: string) => void;
}

const paymentDateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  hourCycle: 'h23', timeZone: 'UTC',
});

export function PaymentSchedulePreview({ startDate, endDate, monthlyPayment, onEndDateChange }: PaymentSchedulePreviewProps) {
  const tableId = useId();
  const [paymentTimes, setPaymentTimes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [expandedRange, setExpandedRange] = useState<string | null>(null);
  const timestamps = getProjectDateTimestamps(startDate, endDate);
  const end = timestamps?.end ?? null;
  const validDates = timestamps !== null;

  useEffect(() => {
    if (!validDates) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPaymentTimes(null);
    // Read-only public RPC: the preview does not need a wallet connection.
    getFundContract().functions.get_global_vars<{ payment_times: string[] }>()
      .then(({ result }) => {
        if (!result?.payment_times) throw new Error('Missing payment times');
        buildPaymentSchedule(startDate, endDate, result.payment_times);
        if (!cancelled) setPaymentTimes(result.payment_times);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [validDates, startDate, endDate, refresh]);

  const slots = validDates && paymentTimes ? buildPaymentSchedule(startDate, endDate, paymentTimes) : [];
  const eligible = slots.filter(slot => slot.eligible);
  const units = requestedPaymentUnits(monthlyPayment);
  const excludedEndPayment = slots.find(slot => slot.reason === 'ended' &&
    new Date(slot.timestamp).toISOString().slice(0, 10) === endDate);
  const projected = slots.some(slot => slot.source === 'projected');
  const rangeKey = `${startDate}:${endDate}`;
  const expanded = expandedRange === rangeKey;
  const compact = slots.length > 6 && !expanded;
  const visibleSlots = compact ? [...slots.slice(0, 2), ...slots.slice(-2)] : slots;

  return (
    <section aria-label="Payment schedule preview" className="rounded-2xl border border-line-strong p-5 space-y-4">
      <h3 className="text-[16px] font-semibold tracking-[-0.01em]">Payment preview</h3>
      {!validDates ? (
        <p className="text-sm text-ink-2">Choose valid start and end dates to see which payments are included.</p>
      ) : loading ? (
        <p role="status" className="text-sm text-ink-2 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading payment dates from the fund...
        </p>
      ) : error ? (
        <div role="alert" className="space-y-2">
          <p className="text-sm">Payment dates could not be loaded. Check the schedule before submitting.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setRefresh(value => value + 1)}>Retry payment preview</Button>
        </div>
      ) : paymentTimes ? (
        <>
          <p className="text-sm text-ink-2">
            Start: {paymentDateFormat.format(timestamps!.start)} UTC.
            {' '}End: {paymentDateFormat.format(timestamps!.end)} UTC.
            {' '}Monthly payments are normally scheduled for the last day of the month at 12:00 UTC.
            {' '}The final day ends at 13:00 UTC, one hour after the scheduled payment.
            {' '}The proposal must still be active when payment is processed.
          </p>
          {excludedEndPayment && (
            <div role="alert" className="rounded-xl bg-panel-strong p-4 space-y-3">
              <p className="text-sm">
                Your end date excludes the payment on {paymentDateFormat.format(excludedEndPayment.timestamp)} UTC.
                {' '}The proposal ends at 13:00 UTC, at or before this payment.
              </p>
              <Button type="button" variant="outline" size="sm" className="h-auto whitespace-normal" onClick={() => onEndDateChange(endDateAfterPayment(excludedEndPayment.timestamp))}>
                Include this payment: end on {endDateAfterPayment(excludedEndPayment.timestamp)}
              </Button>
            </div>
          )}
          <p className="font-medium text-sm" role="status">
            {eligible.length} eligible payment{eligible.length === 1 ? '' : 's'}
            {units !== null && <> · Up to {formatKoinUnits(units * BigInt(eligible.length))} KOIN in total</>}
          </p>
          {eligible.length === 0 && <p className="text-sm text-danger">No scheduled payment falls within these dates.</p>}
          {slots.length > 0 && (
            <div className="overflow-auto max-h-80">
              <table id={tableId} className="w-full text-sm text-left">
                <thead><tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-3 font-medium">Scheduled (UTC)</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Up to (KOIN)</th>
                  <th scope="col" className="py-2 font-medium">Included?</th>
                </tr></thead>
                <tbody>{visibleSlots.map((slot, index) => (
                  <PaymentRows key={slot.timestamp} slot={slot} units={units} hiddenCount={compact && index === 2 ? slots.length - 4 : 0} />
                ))}</tbody>
              </table>
            </div>
          )}
          {slots.length > 6 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setExpandedRange(expanded ? null : rangeKey)} aria-expanded={expanded} aria-controls={tableId}>
              {expanded ? 'Show fewer dates' : `Show all ${slots.length} payment dates`}
            </Button>
          )}
          {!projected && end !== null && end > Number(paymentTimes[paymentTimes.length - 1]) && (
            <p className="text-xs text-ink-2">Only registered payment dates are shown. The fund has not registered later dates, and its current schedule could not be projected.</p>
          )}
          {projected && <p className="text-xs text-ink-2">Dates beyond the fund&apos;s registered schedule are projected using the current month-end rule and may change.</p>}
          <p className="text-sm text-ink-2">
            Included payments are eligible, not guaranteed. The fund pays projects by vote ranking and available budget; each payment can be full, partial, or zero.
            {' '}Payments are processed in the first block that triggers the scheduled payout, so receipt may be later than the time shown. There is no daily proration.
          </p>
        </>
      ) : null}
    </section>
  );
}

function PaymentRows({ slot, units, hiddenCount }: { slot: ReturnType<typeof buildPaymentSchedule>[number]; units: bigint | null; hiddenCount: number }) {
  return (
    <>
      {hiddenCount > 0 && <tr><td colSpan={3} className="py-3 text-center text-ink-2">{hiddenCount} more payment dates between these months</td></tr>}
      <tr className="border-b border-line">
        <td className="py-3 pr-3">
          <time dateTime={new Date(slot.timestamp).toISOString()}>{paymentDateFormat.format(slot.timestamp)}</time>
          {slot.source === 'projected' && <span className="block text-xs text-ink-2">Projected date</span>}
        </td>
        <td className="py-3 pr-3">{slot.eligible ? units !== null ? formatKoinUnits(units) : 'Enter amount' : '0'}</td>
        <td className="py-3">{slot.eligible ? 'Yes' : slot.reason === 'ended' ? 'No — proposal ended' : 'No — not started'}</td>
      </tr>
    </>
  );
}
