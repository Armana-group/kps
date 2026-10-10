"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const GUIDE_PATH = "/llms-full.txt";

// Readers mostly paste the guide's URL into an AI assistant, so a plain click
// copies it. A modifier-click, middle-click or right-click still opens the file.
export function CopyGuideLink({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(new URL(GUIDE_PATH, window.location.origin).href);
      setCopied(true);
    } catch {
      window.location.assign(GUIDE_PATH); // No clipboard access: show the file instead
    }
  };

  return (
    <a
      href={GUIDE_PATH}
      onClick={copy}
      title="Copy a link to this guide as plain text, to give an AI assistant"
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-dashed border-line-strong px-3.5 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink hover:text-ink",
        copied && "border-solid border-ink text-ink",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" strokeWidth={2} /> : <Copy className="size-3.5" strokeWidth={1.8} />}
      {copied ? "Link copied" : "Copy for AI"}
    </a>
  );
}
