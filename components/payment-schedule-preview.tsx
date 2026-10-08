"use client";

import { useEffect, useState } from 'react';
import { CalendarClock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFundContract } from '@/lib/utils';
import { buildPaymentSchedule, endDateAfterPayment, formatKoinUnits, parseUtcDate, requestedPaymentUnits } from '@/lib/payment-schedule';

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
  const [paymentTimes, setPaymentTimes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const start = parseUtcDate(startDate);
  const end = parseUtcDate(endDate);
  const validDates = start !== null && end !== null && start < end;

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

  return (
    <section aria-label="Payment schedule preview" className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-primary" /> Payment Preview
      </h3>
      {!validDates ? (
        <p className="text-sm text-muted-foreground">Choose valid start and end dates to see which payments are included.</p>
      ) : loading ? (
        <p role="status" className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading payment dates from the fund...
        </p>
      ) : error ? (
        <div role="alert" className="space-y-2">
          <p className="text-sm">Payment dates could not be loaded. Check the schedule before submitting.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setRefresh(value => value + 1)}>Retry payment preview</Button>
        </div>
      ) : paymentTimes ? (
        <>
          <p className="text-sm text-muted-foreground">
            Dates start at 00:00 UTC. The end date is exclusive: the proposal must still be active when payment is processed.
          </p>
          {excludedEndPayment && (
            <div role="alert" className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 space-y-3">
              <p className="text-sm">
                Your end date excludes the payment on {paymentDateFormat.format(excludedEndPayment.timestamp)} UTC.
                {' '}The proposal ends at 00:00 UTC, before this payment.
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
          {eligible.length === 0 && <p className="text-sm text-amber-600 dark:text-amber-400">No scheduled payment falls within these dates.</p>}
          {slots.length > 0 && (
            <div className="overflow-auto max-h-80">
              <table className="w-full text-sm text-left">
                <thead><tr className="border-b border-border">
                  <th scope="col" className="py-2 pr-3 font-medium">Scheduled (UTC)</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Up to (KOIN)</th>
                  <th scope="col" className="py-2 font-medium">Included?</th>
                </tr></thead>
                <tbody>{slots.map(slot => (
                  <tr key={slot.timestamp} className="border-b border-border/50">
                    <td className="py-3 pr-3">
                      <time dateTime={new Date(slot.timestamp).toISOString()}>{paymentDateFormat.format(slot.timestamp)}</time>
                      {slot.source === 'projected' && <span className="block text-xs text-muted-foreground">Projected date</span>}
                    </td>
                    <td className="py-3 pr-3">{slot.eligible ? units !== null ? formatKoinUnits(units) : 'Enter amount' : '0'}</td>
                    <td className="py-3">{slot.eligible ? 'Yes' : slot.reason === 'ended' ? 'No — proposal ended' : 'No — not started'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {!projected && end !== null && end > Number(paymentTimes[paymentTimes.length - 1]) && (
            <p className="text-xs text-muted-foreground">Only registered payment dates are shown. The fund has not registered later dates, and its current schedule could not be projected.</p>
          )}
          {projected && <p className="text-xs text-muted-foreground">Dates beyond the fund&apos;s registered schedule are projected using the current month-end rule and may change.</p>}
          <p className="text-sm text-muted-foreground">
            Included payments are eligible, not guaranteed. The fund pays projects by vote ranking and available budget; each payment can be full, partial, or zero.
            {' '}Payments are processed in the first block that triggers the scheduled payout, so receipt may be later than the time shown. There is no daily proration.
          </p>
        </>
      ) : null}
    </section>
  );
}
