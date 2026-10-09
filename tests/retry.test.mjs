import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/retry.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { withRetry } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('returns the first successful result without retrying', async () => {
  let calls = 0;
  assert.equal(await withRetry(async () => { calls++; return 'ok'; }, { attempts: 2, delayMs: 0 }), 'ok');
  assert.equal(calls, 1);
});

test('retries after a failure and returns the later result', async () => {
  let calls = 0;
  const result = await withRetry(async () => {
    calls++;
    if (calls === 1) throw new TypeError('Failed to fetch');
    return 'second';
  }, { attempts: 2, delayMs: 0 });
  assert.equal(result, 'second');
  assert.equal(calls, 2);
});

test('gives up after the last attempt and throws its error', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(async () => { calls++; throw new Error(`fail ${calls}`); }, { attempts: 3, delayMs: 0 }),
    /fail 3/,
  );
  assert.equal(calls, 3);
});

test('waits between attempts', async () => {
  let calls = 0;
  const start = Date.now();
  await withRetry(async () => { if (++calls < 2) throw new Error('busy'); }, { attempts: 2, delayMs: 50 });
  assert.ok(Date.now() - start >= 45);
});
