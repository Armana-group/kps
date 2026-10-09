import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/payouts.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { distributePayments } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const project = (id, votes, monthly) => ({ id, total_votes: String(votes), monthly_payment: String(monthly) });
const summary = list => list.map(p => [p.id, p.calculatedPayment, p.paymentStatus]);

test('pays in vote order: full, then partial, then nothing', () => {
  const result = distributePayments([project(3, 1984, 5000), project(1, 192602, 50000), project(2, 93502, 100000000)], 450000);
  assert.deepEqual(summary(result), [[1, 50000, 'full'], [2, 400000, 'partial'], [3, 0, 'none']]);
});

test('projects without votes get nothing even when money is left', () => {
  assert.deepEqual(summary(distributePayments([project(1, 0, 10)], 1000)), [[1, 0, 'none']]);
});

test('an empty fund pays nothing', () => {
  assert.deepEqual(summary(distributePayments([project(1, 5, 10)], 0)), [[1, 0, 'none']]);
});

test('a project asking for 0 counts as fully paid while the fund has money', () => {
  assert.deepEqual(summary(distributePayments([project(1, 5, 0)], 100)), [[1, 0, 'full']]);
});

test('the input list is not reordered', () => {
  const input = [project(1, 1, 1), project(2, 2, 1)];
  distributePayments(input, 10);
  assert.deepEqual(input.map(p => p.id), [1, 2]);
});
