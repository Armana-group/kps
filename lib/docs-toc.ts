// Helpers for content/docs.md, the single source for /docs, /llms.txt and /llms-full.txt.
// Kept free of runtime imports so the node tests can load it directly.

export interface DocsSection {
  id: string;
  title: string;
  number: number;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

/** Top-level (##) sections, skipping anything inside code fences. */
export function getTableOfContents(markdown: string): DocsSection[] {
  const sections: DocsSection[] = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) inFence = !inFence;
    const match = !inFence && /^## (.+)$/.exec(line.trim());
    if (match) {
      const title = match[1].trim();
      sections.push({ id: slugify(title), title, number: sections.length + 1 });
    }
  }
  return sections;
}

/** The blockquote under the title, used as the one-line summary. */
export function getDocsSummary(markdown: string): string {
  const quote = markdown.split('\n').find(line => line.startsWith('> '));
  return quote ? quote.slice(2).trim() : '';
}

/** An index in the llmstxt.org format, linking each section of the guide. */
export function buildLlmsIndex(markdown: string, siteUrl: string): string {
  const title = /^# (.+)$/m.exec(markdown)?.[1].trim() ?? 'Documentation';
  const sections = getTableOfContents(markdown)
    .map(section => `- [${section.title}](${siteUrl}/docs#${section.id})`);
  return [
    `# ${title}`,
    '',
    `> ${getDocsSummary(markdown)}`,
    '',
    `The site is ${siteUrl}. Votes and payments happen on Koinos mainnet through the fund contract described in the guide.`,
    '',
    '## Docs',
    '',
    `- [Full guide](${siteUrl}/llms-full.txt): the whole guide as Markdown`,
    ...sections,
    '',
  ].join('\n');
}
