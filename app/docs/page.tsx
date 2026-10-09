import Link from "next/link";
import { ArrowLeft, Bot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocsSidebar } from "@/components/docs-sidebar";
import { getDocsSummary, getTableOfContents } from "@/lib/docs-toc";
import { getDocsHtml, getDocsMarkdown } from "@/lib/docs";

// The guide's text lives in content/docs.md, which also feeds /llms.txt and /llms-full.txt.
export default function DocsPage() {
  const markdown = getDocsMarkdown();
  const sections = getTableOfContents(markdown);

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <div className="flex">
        <DocsSidebar sections={sections} />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="max-w-4xl mx-auto px-4 lg:px-6 py-6 lg:py-12">
            {/* Hero Section */}
            <section className="text-center mb-8 lg:mb-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4 lg:mb-6 tracking-tight">
                Koinos Fund System
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6 lg:mb-8">
                {getDocsSummary(markdown)}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-4">
                <Button asChild className="h-10 px-5 py-2 rounded-lg">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Platform
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-10 px-5 py-2 rounded-lg">
                  <a href="https://koinos.io" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn About Koinos
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Bot className="w-4 h-4" />
                Using an AI assistant? Give it <a href="/llms-full.txt" className="underline hover:text-foreground">/llms-full.txt</a>
              </p>
            </section>

            <article
              className="docs-content"
              // Rendered from our own content/docs.md at build time, not user input
              dangerouslySetInnerHTML={{ __html: getDocsHtml(markdown) }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
