import Link from "next/link";
import { DocsSidebar } from "@/components/docs-sidebar";
import { getDocsSummary, getTableOfContents } from "@/lib/docs-toc";
import { getDocsHtml, getDocsMarkdown } from "@/lib/docs";

// The guide's text lives in content/docs.md, which also feeds /llms.txt and /llms-full.txt.
export default function DocsPage() {
  const markdown = getDocsMarkdown();
  const sections = getTableOfContents(markdown);

  return (
    <div className="wrap">
      <div className="grid gap-10 pt-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20 lg:pt-16">
        <DocsSidebar sections={sections} />

        <main className="min-w-0 max-w-[720px]">
          <h1 className="text-[36px] font-bold leading-[1.04] tracking-[-0.035em] lg:text-[48px]">How the fund works</h1>
          <p className="mt-5 max-w-[52ch] text-[18px] leading-normal text-ink-2">{getDocsSummary(markdown)}</p>
          <p className="mt-6 text-sm text-ink-2">
            Using an AI assistant? Give it{" "}
            <Link href="/llms-full.txt" className="text-ink underline underline-offset-[3px]">/llms-full.txt</Link>, the whole guide as plain text.
          </p>

          <article
            className="docs-content mt-14 border-t border-line pt-12"
            // Rendered from our own content/docs.md at build time, not user input
            dangerouslySetInnerHTML={{ __html: getDocsHtml(markdown) }}
          />
        </main>
      </div>
    </div>
  );
}
