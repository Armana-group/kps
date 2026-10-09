"use client";

import { useEffect, useState } from "react";
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
    <nav aria-label="Contents" className="lg:sticky lg:top-[100px] lg:self-start">
      <p className="hidden text-sm font-semibold lg:block">Contents</p>
      <ol className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
        {sections.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className={cn(
                "flex items-baseline gap-3 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:px-0 lg:pl-4 lg:py-1.5",
                current === item.id
                  ? "border-ink text-ink lg:border-ink"
                  : "border-line-strong text-ink-2 hover:text-ink lg:border-line",
              )}
            >
              <span className="hidden text-[12px] tabular-nums text-ink-3 lg:inline">{item.number}</span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
