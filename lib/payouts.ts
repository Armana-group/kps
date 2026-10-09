// Mirrors pay_projects in the fund contract
// (koinos-contracts-as, contracts/fund/assembly/Fund.ts).
// Kept free of runtime imports so the node tests can load it directly.

/** `stays`: the project is paid to the fund itself, so its share never leaves the fund. */
export type PaymentStatus = 'full' | 'partial' | 'stays' | 'none';

interface Payable {
  total_votes: string;
  monthly_payment: string;
  beneficiary: string;
}

/**
 * What each project receives at a payout. The contract walks active projects
 * from most to fewest votes, taking each one's monthly ask out of the budget
 * until it runs out. A project without votes, or paid to the fund itself,
 * still uses its share of the budget but no KOIN is sent.
 * Returns a new list sorted by votes.
 */
export function distributePayments<T extends Payable>(projects: T[], budget: number, fundAddress: string) {
  let left = budget;
  return [...projects]
    .sort((a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes))
    .map(project => {
      const ask = parseFloat(project.monthly_payment);
      const share = Math.min(ask, Math.max(left, 0));
      left -= share;
      const hasVotes = parseFloat(project.total_votes) > 0;
      const paymentStatus: PaymentStatus =
        !hasVotes || share <= 0 ? 'none'
        : project.beneficiary === fundAddress ? 'stays'
        : share < ask ? 'partial'
        : 'full';
      return { ...project, calculatedPayment: paymentStatus === 'none' ? 0 : share, paymentStatus };
    });
}

/** Whether a project takes part in the payout at `payoutTime`: started, and not yet ended. */
export function isInPayout(project: { start_date: Date; end_date: Date }, payoutTime: Date): boolean {
  return project.start_date <= payoutTime && project.end_date > payoutTime;
}

/** Payouts run at noon UTC on the last day of each month. */
export function previousPayoutTime(nextPayout: Date): Date {
  return payoutInMonth(nextPayout.getUTCFullYear(), nextPayout.getUTCMonth() - 1);
}

export interface PayoutBudget {
  /** KOIN that has arrived since the last payout. */
  receivedSoFar: number;
  /** KOIN expected to have arrived by the payout, at the rate so far. */
  expectedReceived: number;
  /** What the payout can spend: twice what arrived, capped at the balance. */
  budget: number;
}

/**
 * The contract lets each payout spend twice the KOIN received since the
 * previous payout (balance minus `remaining_balance`), never more than the
 * balance. New KOIN arrives with every block, so the amount at payout time is
 * projected from the rate so far.
 */
export function estimatePayoutBudget({ balance, remainingBalance, nextPayout, now }: {
  balance: number;
  remainingBalance: number;
  nextPayout: Date;
  now: Date;
}): PayoutBudget {
  const previous = previousPayoutTime(nextPayout).getTime();
  const elapsed = Math.max(now.getTime() - previous, 1);
  const period = nextPayout.getTime() - previous;
  const receivedSoFar = Math.max(balance - remainingBalance, 0);
  const expectedReceived = Math.max(receivedSoFar, receivedSoFar * (period / elapsed));
  const budget = Math.min(remainingBalance + expectedReceived, 2 * expectedReceived);
  return { receivedSoFar, expectedReceived, budget };
}

/** Noon UTC on the last day of a month (month may overflow, as with Date.UTC). */
function payoutInMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month + 1, 1) - 12 * 3600 * 1000);
}

/**
 * When a vote cast now expires: update_vote sets it to the sixth upcoming
 * payout, and it still counts in that payout.
 */
export function voteExpiry(now: Date = new Date()): Date {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const firstMonth = now < payoutInMonth(year, month) ? month : month + 1;
  return payoutInMonth(year, firstMonth + 5);
}

/** How many payouts a project with these dates takes part in. */
export function countPayouts(start: Date, end: Date): number {
  let count = 0;
  for (let month = start.getUTCMonth(), payout = payoutInMonth(start.getUTCFullYear(), month);
    payout < end;
    payout = payoutInMonth(start.getUTCFullYear(), ++month)) {
    if (isInPayout({ start_date: start, end_date: end }, payout)) count++;
  }
  return count;
}
