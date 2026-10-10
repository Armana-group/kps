"use client";

import { useEffect, useState } from "react";
import { CopyGuideLink } from "@/components/copy-guide-link";
import type { DocsSection } from "@/lib/docs-toc";
import { cn } from "@/lib/utils";

// Contents list. A sticky column on desktop, a horizontal strip on phones.
export function DocsSidebar({ sections }: { sections: DocsSection[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  // Highlight the section that is on screen
  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  return (
    // On phones the strip sticks under the site header, so a reader can jump
    // between sections without scrolling back to the top.
    <nav
      aria-label="Contents"
      className="sticky top-16 z-30 -mx-5 min-w-0 bg-paper px-5 py-3 sm:-mx-8 sm:px-8 lg:top-[100px] lg:mx-0 lg:self-start lg:px-0 lg:py-0"
    >
      <p className="hidden text-sm font-semibold lg:block">Contents</p>
      <CopyGuideLink className="hidden lg:mt-4 lg:inline-flex" />
      <ol className="-mx-5 flex gap-1 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
        {sections.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className={cn(
                "block whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:px-0 lg:pl-4 lg:py-1.5",
                current === item.id
                  ? "border-ink text-ink lg:border-ink"
                  : "border-line-strong text-ink-2 hover:text-ink lg:border-line",
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

