"use client";

import { useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import type { DocsSection } from "@/lib/docs-toc";

export function DocsSidebar({ sections }: { sections: DocsSection[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-md bg-background/95 backdrop-blur border border-border/50 hover:bg-accent/50 transition-colors"
        aria-label="Open contents"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Table of Contents */}
      <div className={`
        w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-border/50 bg-card/30 backdrop-blur-sm z-50
        ${isMobileMenuOpen ? 'fixed left-0' : 'hidden lg:block'}
      `}>
        <div className="p-6 sticky top-0">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Contents</h2>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden ml-auto p-1 rounded-md hover:bg-accent/50 transition-colors"
              aria-label="Close contents"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-2">
            {sections.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors group"
              >
                <div className="w-6 h-6 shrink-0 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                  {item.number}
                </div>
                <span className="text-foreground/80 group-hover:text-foreground">
                  {item.title}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
