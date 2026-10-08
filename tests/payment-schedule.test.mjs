import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Use the project's TypeScript compiler so tests also run on Next.js-supported Node 18/20.
const source = readFileSync(new URL('../lib/payment-schedule.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { buildPaymentSchedule, parseUtcDate, endDateAfterPayment, requestedPaymentUnits, formatKoinUnits } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const times = [
  '2026-10-31T12:00:00Z', '2026-11-30T12:00:00Z', '2026-12-31T12:00:00Z',
  '2027-01-31T12:00:00Z', '2027-02-28T12:00:00Z', '2027-03-31T12:00:00Z',
].map(date => String(Date.parse(date)));
const eligible = (start, end, schedule = times) => buildPaymentSchedule(start, end, schedule)
  .filter(slot => slot.eligible).map(slot => new Date(slot.timestamp).toISOString());

test('regression: 31 January end excludes January noon payment; 1 February includes it', () => {
  assert.deepEqual(eligible('2026-11-01', '2027-01-31'), [
    '2026-11-30T12:00:00.000Z', '2026-12-31T12:00:00.000Z',
  ]);
  const excluded = buildPaymentSchedule('2026-11-01', '2027-01-31', times).at(-1);
  assert.equal(excluded.reason, 'ended');
  assert.equal(endDateAfterPayment(excluded.timestamp), '2027-02-01');
  assert.equal(eligible('2026-11-01', '2027-02-01').length, 3);
});

test('start date is inclusive: starting on payment day at midnight includes noon', () => {
  assert.deepEqual(eligible('2027-01-31', '2027-02-01'), ['2027-01-31T12:00:00.000Z']);
});

test('exact start timestamp is included and exact end timestamp is excluded', () => {
  const midnightTimes = ['2027-01-01T00:00:00Z', '2027-02-01T00:00:00Z'].map(time => String(Date.parse(time)));
  assert.deepEqual(eligible('2027-01-01', '2027-02-01', midnightTimes), ['2027-01-01T00:00:00.000Z']);
});

test('mid-month end and reversed/empty ranges contain no eligible payments', () => {
  assert.deepEqual(eligible('2027-01-01', '2027-01-15'), []);
  for (const [start, end] of [['', '2027-02-01'], ['2027-02-01', ''], ['2027-02-01', '2027-01-01'], ['2027-01-01', '2027-01-01']]) {
    assert.deepEqual(buildPaymentSchedule(start, end, times), []);
  }
});

test('contract timestamps are authoritative, even when not noon/month-end', () => {
  const unusual = [String(Date.parse('2027-01-15T08:30:00Z'))];
  assert.deepEqual(eligible('2027-01-01', '2027-02-01', unusual), ['2027-01-15T08:30:00.000Z']);
  assert.equal(buildPaymentSchedule('2027-01-01', '2027-04-01', unusual).length, 1);
});

test('later mainnet dates are projected, including leap February and year rollover', () => {
  const schedule = buildPaymentSchedule('2027-12-01', '2028-03-01', times);
  assert.deepEqual(schedule.filter(slot => slot.eligible).map(slot => new Date(slot.timestamp).toISOString()), [
    '2027-12-31T12:00:00.000Z', '2028-01-31T12:00:00.000Z', '2028-02-29T12:00:00.000Z',
  ]);
  assert.ok(schedule.every(slot => slot.source === 'projected'));
  assert.equal(endDateAfterPayment(Date.parse('2028-02-29T12:00:00Z')), '2028-03-01');
});

test('registered schedule stays distinct from projected dates', () => {
  const schedule = buildPaymentSchedule('2027-03-01', '2027-05-01', times);
  assert.deepEqual(schedule.map(slot => slot.source), ['contract', 'projected', 'projected']);
});

test('UTC date parsing rejects rolled-over and invalid dates', () => {
  assert.equal(parseUtcDate('2028-02-29'), Date.parse('2028-02-29T00:00:00Z'));
  for (const value of ['2027-02-29', '2027-04-31', '2027-13-01', '2027-1-1', 'bad']) assert.equal(parseUtcDate(value), null);
});

test('invalid or empty contract schedule is rejected instead of fabricating payment dates', () => {
  for (const schedule of [[], ['bad'], ['0'], [times[1], times[0]], [times[0], times[0]]]) {
    assert.throws(() => buildPaymentSchedule('2026-11-01', '2027-02-01', schedule));
  }
});

test('requested totals use exact integer KOIN units after submission rounding', () => {
  const units = requestedPaymentUnits('34000');
  assert.equal(formatKoinUnits(units * BigInt(2)), '68,000');
  assert.equal(formatKoinUnits(units * BigInt(3)), '102,000');
  assert.equal(formatKoinUnits(requestedPaymentUnits('0.00000001') * BigInt(3)), '0.00000003');
  assert.equal(formatKoinUnits(requestedPaymentUnits('0.1') * BigInt(3)), '0.3');
  for (const value of ['', '0', '-1', 'bad', 'Infinity']) assert.equal(requestedPaymentUnits(value), null);
});
