import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const config = JSON.parse(readFileSync(new URL('../config/proposal-notices.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../lib/proposal-visibility.ts', import.meta.url), 'utf8');
async function loadVisibility(entries) {
  const withConfig = source.replace("import configuredNotices from '../config/proposal-notices.json';", `const configuredNotices = ${JSON.stringify(entries)};`);
  const compiled = ts.transpileModule(withConfig, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
}
const { getProposalNotice, getProposalNoticeText, isProposalHidden } = await loadVisibility(config);

test('configured proposals without votes are hidden when requested', () => {
  for (const { id } of config) {
    assert.ok(getProposalNotice(id));
    assert.equal(isProposalHidden(id, []), true);
    assert.equal(isProposalHidden(id, ['0', '0', '0', '0', '0', '0']), true);
  }
});

test('any remaining raw vote keeps configured proposals visible, even below display rounding', () => {
  for (const { id } of config) {
    assert.equal(isProposalHidden(id, ['0', '1', '0']), false);
    assert.equal(isProposalHidden(id, ['18446744073709551615']), false);
  }
});

test('unlisted proposals remain visible with or without votes', () => {
  assert.equal(getProposalNotice(3), undefined);
  assert.equal(isProposalHidden(3, ['0']), false);
  assert.equal(isProposalHidden(3, ['1']), false);
});

test('generic notice text and independent visibility/styling options survive lookup', async () => {
  const entry = { id: 41, hideWhenNoVotes: false, muted: false, notice: { title: 'Replaced', summary: 'Use proposal 42.', details: 'A corrected version is available as proposal 42.' } };
  const custom = await loadVisibility([entry]);
  assert.deepEqual(custom.getProposalNotice(41), entry);
  assert.equal(custom.isProposalHidden(41, []), false);
  assert.equal(custom.isProposalHidden(41, ['1']), false);
  assert.equal(custom.getProposalNotice(9), undefined);
});

test('compact and detail views select only the configured wording', () => {
  const notice = { title: 'Maintenance notice', summary: 'A short custom message.', details: 'A full custom message.\nNo invalidity or voting language.' };
  assert.equal(getProposalNoticeText(notice, 'compact'), notice.summary);
  assert.equal(getProposalNoticeText(notice, 'detail'), notice.details);
});

test('details fall back to the summary when missing, empty, or whitespace-only', () => {
  for (const details of [undefined, '', '  \n ']) {
    const notice = { title: 'Custom title', summary: 'Custom summary', details };
    assert.equal(getProposalNoticeText(notice, 'detail'), notice.summary);
  }
});
