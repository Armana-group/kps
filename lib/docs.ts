import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { slugify } from '@/lib/docs-toc';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kfs.koinscan.com';

/** The guide's Markdown source. Read at build time; every docs route is static. */
export function getDocsMarkdown(): string {
  return readFileSync(path.join(process.cwd(), 'content', 'docs.md'), 'utf8');
}

const marked = new Marked({
  renderer: {
    // Give headings ids so the sidebar and /llms.txt can link to them
    heading({ tokens, depth, text }) {
      return `<h${depth} id="${slugify(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
  },
});

/** The guide as HTML, without its title and summary (the page renders those itself). */
export function getDocsHtml(markdown: string): string {
  const body = markdown.replace(/^# .+\n+(> .+\n+)?/, '');
  return marked.parse(body, { async: false });
}
