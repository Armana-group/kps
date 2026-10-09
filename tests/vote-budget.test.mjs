import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/vote-budget.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { getVoteBudget, isVoteActive, explainVoteError } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const now = new Date('2026-10-09T12:00:00Z');
const future = new Date('2027-03-31T00:00:00Z');
const past = new Date('2026-04-30T00:00:00Z');
// weight is in 5% units, as stored by the fund contract
const vote = (project_id, percent, expiration = future) => ({ project_id, weight: percent / 5, expiration });

// Matches koinos-contracts-as Fund.ts: a wallet's running weight total only
// drops when a vote is set to 0, so expired votes still use up the 100%.
test('every vote with weight counts toward the 100%, expired ones included', () => {
  const votes = [vote(3, 50), vote(7, 25, past), vote(9, 0)];
  assert.deepEqual(getVoteBudget(votes), { usedPercent: 75, remainingPercent: 25 });
});

test('only unexpired votes with weight count toward a project', () => {
  assert.equal(isVoteActive(vote(3, 50), now), true);
  assert.equal(isVoteActive(vote(7, 25, past), now), false);
  assert.equal(isVoteActive(vote(9, 0), now), false);
});

test('no votes leaves the full 100% available', () => {
  assert.deepEqual(getVoteBudget([]), { usedPercent: 0, remainingPercent: 100 });
});

test('the project being voted on is excluded, since a new vote replaces it', () => {
  const votes = [vote(3, 50), vote(4, 30)];
  assert.deepEqual(getVoteBudget(votes, 3), { usedPercent: 30, remainingPercent: 70 });
});

test('remaining never goes below zero', () => {
  assert.deepEqual(getVoteBudget([vote(1, 100), vote(2, 50)]), { usedPercent: 150, remainingPercent: 0 });
});

test('the over-100% contract error is explained using the other votes', () => {
  const votes = [vote(3, 50), vote(8, 25)];
  const message = explainVoteError(new Error('votes have exceeded 100% by 50%'), votes, now, 8, { 3: 'Koinos Docs' });
  assert.equal(message,
    "You've already given 50% of your vote to other projects (Koinos Docs), so you can give this one up to 50%. " +
    'Lower the percentage, or reduce one of your other votes first.');
});

test('a forgotten expired vote is named and explained', () => {
  const message = explainVoteError(new Error('votes have exceeded 100% by 50%'), [vote(5, 50, past)], now, 8, { 5: 'Old meetup' });
  assert.equal(message,
    "You've already given 50% of your vote to other projects (Old meetup), so you can give this one up to 50%. " +
    'Lower the percentage, or reduce one of your other votes first. ' +
    'Expired votes still use up your share until you remove them under "Your votes".');
});

test('projects without a known title fall back to their number', () => {
  const message = explainVoteError('votes have exceeded 100% by 25%', [vote(3, 50), vote(4, 25)], now, 8);
  assert.match(message, /\(#3, #4\)/);
  assert.match(message, /up to 25%/);
});

test('unrelated errors are left for the caller to handle', () => {
  assert.equal(explainVoteError(new Error('Transaction rejected by user'), [], now, 8), null);
  assert.equal(explainVoteError(undefined, [], now, 8), null);
});
