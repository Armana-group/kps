import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/payouts.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const payouts =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const { distributePayments, estimatePayoutBudget, previousPayoutTime, isInPayout, voteExpiry } = payouts;

// These follow pay_projects in koinos-contracts-as contracts/fund/assembly/Fund.ts
const FUND = 'FUND';
const project = (id, votes, monthly, beneficiary = `B${id}`) => ({ id, total_votes: String(votes), monthly_payment: String(monthly), beneficiary });
const summary = list => list.map(p => [p.id, p.calculatedPayment, p.paymentStatus]);

test('pays in vote order from the budget: full, then partial, then nothing', () => {
  const result = distributePayments([project(3, 1984, 5000), project(1, 192602, 50000), project(2, 93502, 100000)], 120000, FUND);
  assert.deepEqual(summary(result), [[1, 50000, 'full'], [2, 70000, 'partial'], [3, 0, 'none']]);
});

test('a project paid to the fund itself uses budget but the KOIN stays in the fund', () => {
  const result = distributePayments([project(1, 10, 50000), project(2, 5, 1e8, FUND), project(3, 1, 5000)], 83875, FUND);
  assert.deepEqual(summary(result), [[1, 50000, 'full'], [2, 33875, 'stays'], [3, 0, 'none']]);
});

test('projects without votes receive nothing', () => {
  assert.deepEqual(summary(distributePayments([project(1, 0, 10)], 1000, FUND)), [[1, 0, 'none']]);
});

test('an empty budget pays nothing', () => {
  assert.deepEqual(summary(distributePayments([project(1, 5, 10)], 0, FUND)), [[1, 0, 'none']]);
});

test('the input list is not reordered', () => {
  const input = [project(1, 1, 1), project(2, 2, 1)];
  distributePayments(input, 10, FUND);
  assert.deepEqual(input.map(p => p.id), [1, 2]);
});

test('the previous payout is noon UTC on the last day of the prior month', () => {
  assert.equal(previousPayoutTime(new Date('2026-10-31T12:00:00Z')).toISOString(), '2026-09-30T12:00:00.000Z');
  assert.equal(previousPayoutTime(new Date('2027-01-31T12:00:00Z')).toISOString(), '2026-12-31T12:00:00.000Z');
  assert.equal(previousPayoutTime(new Date('2027-03-31T12:00:00Z')).toISOString(), '2027-02-28T12:00:00.000Z');
});

test('budget is twice the KOIN received since the last payout, projected to payout time', () => {
  const estimate = estimatePayoutBudget({
    balance: 450000,
    remainingBalance: 410000,
    nextPayout: new Date('2026-10-31T12:00:00Z'),
    now: new Date('2026-10-10T12:00:00Z'), // 10 of 31 days in
  });
  assert.equal(estimate.receivedSoFar, 40000);
  assert.equal(estimate.expectedReceived, 124000);
  assert.equal(estimate.budget, 248000);
});

test('budget never exceeds the balance the fund will hold', () => {
  const estimate = estimatePayoutBudget({
    balance: 100, remainingBalance: 0,
    nextPayout: new Date('2026-10-31T12:00:00Z'), now: new Date('2026-10-31T11:59:00Z'),
  });
  assert.ok(estimate.budget <= 101);
});

test('payout membership follows the contract at payout time', () => {
  const at = new Date('2026-10-31T12:00:00Z');
  const p = (start, end) => ({ start_date: new Date(start), end_date: new Date(end) });
  assert.equal(isInPayout(p('2026-10-01', '2027-01-01'), at), true);
  assert.equal(isInPayout(p('2026-10-20', '2027-01-01'), at), true, 'starts before payout');
  assert.equal(isInPayout(p('2026-11-01', '2027-01-01'), at), false, 'starts after payout');
  assert.equal(isInPayout(p('2026-01-01', '2026-10-31T12:00:00Z'), at), false, 'ends at payout');
});

test('a new vote lasts through the sixth upcoming payout', () => {
  assert.equal(voteExpiry(new Date('2026-10-09T21:00:00Z')).toISOString(), '2027-03-31T12:00:00.000Z');
  // After this month's payout has run, the next payout is next month's
  assert.equal(voteExpiry(new Date('2026-10-31T13:00:00Z')).toISOString(), '2027-04-30T12:00:00.000Z');
  assert.equal(voteExpiry(new Date('2026-12-31T11:00:00Z')).toISOString(), '2027-05-31T12:00:00.000Z');
});

test('counts the payouts a project takes part in, using UTC payout times', () => {
  const { countPayouts } = payouts;
  // Starts Nov 1, ends Jan 31 13:00 UTC: Nov 30, Dec 31 and Jan 31 noon
  assert.equal(countPayouts(new Date('2026-11-01T00:00:00Z'), new Date('2027-01-31T13:00:00Z')), 3);
  // Ends exactly at a payout: that payout is excluded
  assert.equal(countPayouts(new Date('2026-11-01T00:00:00Z'), new Date('2027-01-31T12:00:00Z')), 2);
  // Starts on a payout day at midnight: that payout is included
  assert.equal(countPayouts(new Date('2027-01-31T00:00:00Z'), new Date('2027-02-01T00:00:00Z')), 1);
  assert.equal(countPayouts(new Date('2027-02-01T00:00:00Z'), new Date('2027-01-01T00:00:00Z')), 0);
});
