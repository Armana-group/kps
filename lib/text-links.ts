export interface TextPart {
  text: string;
  href?: string;
}

function trimUrlPunctuation(value: string): string {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  while (value) {
    const last = value[value.length - 1];
    const opening = pairs[last];
    const unmatchedClosing = opening && value.split(last).length > value.split(opening).length;
    if (!/[.,!?;:]/.test(last) && !unmatchedClosing) break;
    value = value.slice(0, -1);
  }
  return value;
}

/** Recognize web URLs while preserving the original text, punctuation, and line breaks. */
export function splitTextLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let offset = 0;
  const pattern = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;

  for (const match of text.matchAll(pattern)) {
    const label = trimUrlPunctuation(match[0]);
    let url: URL;
    try {
      url = new URL(/^www\./i.test(label) ? `https://${label}` : label);
    } catch {
      continue;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index) });
    parts.push({ text: label, href: url.href });
    offset = match.index + label.length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts;
}
