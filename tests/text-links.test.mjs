import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/text-links.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { splitTextLinks } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('long proposal URLs become links and preserve all original text and newlines', () => {
  const url = 'https://github.com/ederaleng/proposals/blob/main/a-very-long-proposal-name.md?view=1&lang=en#budget';
  const text = `Full proposal:\n${url}\n\nOne brief closing update.`;
  const parts = splitTextLinks(text);
  assert.deepEqual(parts.filter(part => part.href), [{ text: url, href: url }]);
  assert.equal(parts.map(part => part.text).join(''), text);
});

test('multiple HTTP, HTTPS, and www links retain sentence punctuation as plain text', () => {
  const text = 'See https://example.org/a, http://example.org/b! Or www.example.org/docs.';
  const parts = splitTextLinks(text);
  assert.deepEqual(parts.filter(part => part.href).map(part => part.href), [
    'https://example.org/a', 'http://example.org/b', 'https://www.example.org/docs',
  ]);
  assert.equal(parts.map(part => part.text).join(''), text);
});

test('balanced URL parentheses stay in the link while enclosing punctuation stays outside', () => {
  const text = '(https://example.org/a_(b)). [https://example.org/docs]';
  const parts = splitTextLinks(text);
  assert.deepEqual(parts.filter(part => part.href).map(part => part.text), [
    'https://example.org/a_(b)', 'https://example.org/docs',
  ]);
  assert.equal(parts.map(part => part.text).join(''), text);
});

test('non-web schemes and malformed URLs remain plain text', () => {
  const text = 'javascript:alert(1) data:text/html,<script> ftp://example.org https://? <img onerror="alert(1)">';
  assert.deepEqual(splitTextLinks(text), [{ text }]);
  assert.deepEqual(splitTextLinks(''), []);
});
