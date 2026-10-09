import { getDocsMarkdown } from '@/lib/docs';

export const dynamic = 'force-static';

export function GET() {
  return new Response(getDocsMarkdown(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
