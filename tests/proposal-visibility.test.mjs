import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const config = JSON.parse(readFileSync(new URL('../config/hidden-proposals.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../lib/proposal-visibility.ts', import.meta.url), 'utf8')
  .replace("import hiddenProposals from '../config/hidden-proposals.json';", `const hiddenProposals = ${JSON.stringify(config)};`);
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { getInvalidProposal, isProposalHidden } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('listed invalid proposals without votes are hidden', () => {
  for (const { id } of config) {
    assert.ok(getInvalidProposal(id));
    assert.equal(isProposalHidden(id, []), true);
    assert.equal(isProposalHidden(id, ['0', '0', '0', '0', '0', '0']), true);
  }
});

test('any remaining raw vote keeps invalid proposals visible, even below display rounding', () => {
  for (const { id } of config) {
    assert.equal(isProposalHidden(id, ['0', '1', '0']), false);
    assert.equal(isProposalHidden(id, ['18446744073709551615']), false);
  }
});

test('unlisted proposals remain visible with or without votes', () => {
  assert.equal(getInvalidProposal(3), undefined);
  assert.equal(isProposalHidden(3, ['0']), false);
  assert.equal(isProposalHidden(3, ['1']), false);
});
