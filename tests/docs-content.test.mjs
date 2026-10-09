import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/docs-toc.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { slugify, getTableOfContents, getDocsSummary, buildLlmsIndex } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const docs = readFileSync(new URL('../content/docs.md', import.meta.url), 'utf8');

test('headings become stable anchor ids', () => {
  assert.equal(slugify('Fees & Costs'), 'fees-costs');
  assert.equal(slugify('Why does it say my votes exceeded 100%?'), 'why-does-it-say-my-votes-exceeded-100');
  assert.equal(slugify('  For Developers and AI Tools '), 'for-developers-and-ai-tools');
});

test('table of contents lists the numbered top-level sections', () => {
  const toc = getTableOfContents('# Title\n\n## One\n\ntext\n\n### Sub\n\n## Fees & Costs\n```\n## not a heading\n```\n');
  assert.deepEqual(toc, [
    { id: 'one', title: 'One', number: 1 },
    { id: 'fees-costs', title: 'Fees & Costs', number: 2 },
  ]);
});

test('the guide keeps the section anchors other pages link to', () => {
  const ids = getTableOfContents(docs).map(section => section.id);
  for (const id of ['overview', 'getting-started', 'wallet-setup', 'browsing-projects', 'voting-system',
    'submitting-projects', 'funding-mechanism', 'fees-costs', 'faq']) {
    assert.ok(ids.includes(id), `missing #${id}`);
  }
});

test('the summary is the blockquote under the title', () => {
  assert.match(getDocsSummary(docs), /^A guide to the Koinos Fund System/);
});

test('llms.txt index follows the llmstxt.org layout and links every section', () => {
  const index = buildLlmsIndex(docs, 'https://kfs.koinscan.com');
  const lines = index.split('\n');
  assert.equal(lines[0], '# Koinos Fund System');
  assert.match(lines[2], /^> A guide/);
  assert.match(index, /\[Full guide\]\(https:\/\/kfs\.koinscan\.com\/llms-full\.txt\)/);
  for (const { id, title } of getTableOfContents(docs)) {
    assert.ok(index.includes(`[${title}](https://kfs.koinscan.com/docs#${id})`), `missing ${title}`);
  }
});
