import { buildLlmsIndex } from '@/lib/docs-toc';
import { getDocsMarkdown, SITE_URL } from '@/lib/docs';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildLlmsIndex(getDocsMarkdown(), SITE_URL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
