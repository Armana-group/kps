// Kept free of runtime imports so the node tests can load it directly.

export type PaymentStatus = 'full' | 'partial' | 'none';

interface Payable {
  total_votes: string;
  monthly_payment: string;
}

/**
 * What each active project receives at the next payout: projects are paid in
 * vote order until the fund runs out. Returns a new list sorted by votes.
 */
export function distributePayments<T extends Payable>(projects: T[], balance: number) {
  let left = balance;
  return [...projects]
    .sort((a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes))
    .map(project => {
      const ask = parseFloat(project.monthly_payment);
      const funded = parseFloat(project.total_votes) > 0 && left > 0;
      const calculatedPayment = funded ? Math.min(ask, left) : 0;
      left -= calculatedPayment;
      const paymentStatus: PaymentStatus = !funded ? 'none' : calculatedPayment < ask ? 'partial' : 'full';
      return { ...project, calculatedPayment, paymentStatus };
    });
}
